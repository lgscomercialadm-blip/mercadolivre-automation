"""
Serviço completo de OAuth2 para Mercado Livre com todas as práticas de segurança.
"""

import aiohttp
import asyncio
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from fastapi import HTTPException, Request
from sqlmodel import Session
import json
import secrets

from app.core.mercadolivre_oauth import (
    MercadoLivreConfig, PKCEConfig, OAuthRequest, TokenResponse,
    SecurityLogger, RateLimiter, ml_config, security_logger, rate_limiter
)
from app.models.oauth_session import OAuthSession
from app.models.oauth_token import OAuthToken
from app.crud.oauth_sessions import save_oauth_session, get_oauth_session, delete_oauth_session
from app.crud.oauth_tokens import save_token_to_db, get_valid_token, delete_user_tokens
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class MercadoLivreOAuthService:
    """Serviço completo de OAuth2 para Mercado Livre."""
    
    def __init__(self):
        self.config = ml_config
        self.security_logger = security_logger
        self.rate_limiter = rate_limiter
        
    async def get_client_ip(self, request: Request) -> str:
        """Extrai IP real do cliente considerando proxies."""
        # Verifica headers de proxy
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
            
        return request.client.host if request.client else "unknown"
    
    async def validate_request_security(self, request: Request, endpoint: str) -> bool:
        """Valida segurança da requisição."""
        client_ip = await self.get_client_ip(request)
        
        # Rate limiting
        if self.rate_limiter.is_rate_limited(client_ip, endpoint):
            self.security_logger.log_security_violation(
                "RATE_LIMIT_EXCEEDED", 
                f"IP excedeu limite para {endpoint}",
                client_ip
            )
            raise HTTPException(
                status_code=429, 
                detail="Muitas tentativas. Tente novamente mais tarde."
            )
        
        # Registra tentativa
        self.rate_limiter.record_attempt(client_ip, endpoint)
        return True
    
    def build_authorization_url(
        self, 
        oauth_request: OAuthRequest,
        state: str,
        code_challenge: str
    ) -> str:
        """Constrói URL de autorização segura com PKCE."""
        
        auth_base_url = self.config.get_auth_url(oauth_request.country_code)
        
        params = {
            "response_type": "code",
            "client_id": oauth_request.client_id,
            "redirect_uri": oauth_request.redirect_uri,
            "scope": oauth_request.scope,
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": self.config.CODE_CHALLENGE_METHOD
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{auth_base_url}/authorization?{query_string}"
    
    async def exchange_code_for_token(
        self,
        code: str,
        oauth_request: OAuthRequest,
        code_verifier: str
    ) -> TokenResponse:
        """Troca código de autorização por access token."""
        
        token_url = f"{self.config.API_BASE_URL}/oauth/token"
        
        # Dados enviados no body por segurança
        data = {
            "grant_type": "authorization_code",
            "client_id": oauth_request.client_id,
            "client_secret": oauth_request.client_secret,
            "code": code,
            "redirect_uri": oauth_request.redirect_uri,
            "code_verifier": code_verifier
        }
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    token_url,
                    data=data,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status != 200:
                        error_data = await response.json()
                        logger.error(f"Erro na troca de token: {error_data}")
                        raise HTTPException(
                            status_code=response.status,
                            detail=f"Erro do Mercado Livre: {error_data.get('error_description', 'Erro desconhecido')}"
                        )
                    
                    token_data = await response.json()
                    
                    # Calcula timestamps
                    created_at = datetime.now()
                    expires_at = created_at + timedelta(seconds=token_data.get("expires_in", 21600))
                    
                    return TokenResponse(
                        access_token=token_data["access_token"],
                        token_type=token_data.get("token_type", "bearer"),
                        expires_in=token_data.get("expires_in", 21600),
                        scope=token_data.get("scope", oauth_request.scope),
                        user_id=token_data["user_id"],
                        refresh_token=token_data.get("refresh_token"),
                        created_at=created_at,
                        expires_at=expires_at
                    )
                    
            except aiohttp.ClientError as e:
                logger.error(f"Erro de rede na troca de token: {e}")
                raise HTTPException(
                    status_code=503,
                    detail="Erro de comunicação com Mercado Livre"
                )
    
    async def refresh_access_token(
        self,
        refresh_token: str,
        client_id: str,
        client_secret: str
    ) -> TokenResponse:
        """Atualiza access token usando refresh token."""
        
        token_url = f"{self.config.API_BASE_URL}/oauth/token"
        
        data = {
            "grant_type": "refresh_token",
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token
        }
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    token_url,
                    data=data,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status != 200:
                        error_data = await response.json()
                        logger.error(f"Erro no refresh de token: {error_data}")
                        
                        # Se refresh token é inválido, força novo login
                        if error_data.get("error") == "invalid_grant":
                            raise HTTPException(
                                status_code=401,
                                detail="Refresh token inválido. Necessário novo login."
                            )
                        
                        raise HTTPException(
                            status_code=response.status,
                            detail=f"Erro do Mercado Livre: {error_data.get('error_description', 'Erro desconhecido')}"
                        )
                    
                    token_data = await response.json()
                    
                    created_at = datetime.now()
                    expires_at = created_at + timedelta(seconds=token_data.get("expires_in", 21600))
                    
                    return TokenResponse(
                        access_token=token_data["access_token"],
                        token_type=token_data.get("token_type", "bearer"),
                        expires_in=token_data.get("expires_in", 21600),
                        scope=token_data.get("scope", "offline_access read write"),
                        user_id=token_data["user_id"],
                        refresh_token=token_data.get("refresh_token"),
                        created_at=created_at,
                        expires_at=expires_at
                    )
                    
            except aiohttp.ClientError as e:
                logger.error(f"Erro de rede no refresh de token: {e}")
                raise HTTPException(
                    status_code=503,
                    detail="Erro de comunicação com Mercado Livre"
                )
    
    async def validate_token_with_ml(self, access_token: str) -> Dict[str, Any]:
        """Valida token diretamente com Mercado Livre."""
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.config.API_BASE_URL}/users/me",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        return await response.json()
                    elif response.status == 401:
                        raise HTTPException(
                            status_code=401,
                            detail="Token inválido ou expirado"
                        )
                    else:
                        raise HTTPException(
                            status_code=response.status,
                            detail="Erro ao validar token"
                        )
                        
            except aiohttp.ClientError as e:
                logger.error(f"Erro de rede na validação de token: {e}")
                raise HTTPException(
                    status_code=503,
                    detail="Erro de comunicação com Mercado Livre"
                )
    
    async def revoke_token(self, access_token: str):
        """Revoga token no Mercado Livre."""
        # Mercado Livre não tem endpoint específico para revogar tokens
        # Tokens expiram automaticamente após 6 horas
        logger.info(f"Token será invalidado localmente e expirará automaticamente")
        
    async def create_test_user(self, access_token: str, site_id: str = "MLB") -> Dict[str, Any]:
        """Cria usuário de teste para desenvolvimento."""
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        data = {"site_id": site_id}
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{self.config.API_BASE_URL}/users/test_user",
                    json=data,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 201:
                        return await response.json()
                    else:
                        error_data = await response.json()
                        raise HTTPException(
                            status_code=response.status,
                            detail=f"Erro ao criar usuário de teste: {error_data}"
                        )
                        
            except aiohttp.ClientError as e:
                logger.error(f"Erro de rede na criação de usuário de teste: {e}")
                raise HTTPException(
                    status_code=503,
                    detail="Erro de comunicação com Mercado Livre"
                )

# Instância global do serviço
ml_oauth_service = MercadoLivreOAuthService()

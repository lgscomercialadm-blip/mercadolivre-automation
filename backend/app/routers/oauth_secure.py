"""
Router OAuth2 completo para Mercado Livre com todas as práticas de segurança.
Versão corrigida para save_oauth_session.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Query, Form
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from typing import Optional, Dict, Any
from datetime import datetime
import logging

from app.db import get_session
from app.core.mercadolivre_oauth import PKCEConfig, OAuthRequest, ml_config, security_logger
from app.services.mercadolivre_oauth import ml_oauth_service
from app.crud.oauth_sessions import save_oauth_session, get_oauth_session, delete_oauth_session
from app.crud.oauth_tokens import save_token_to_db, get_valid_token, delete_user_tokens
from app.auth import get_current_user
from app.models import User
from app.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

router = APIRouter(prefix="/api/oauth", tags=["OAuth2 Mercado Livre"])

@router.get("/login")
async def oauth_login(
    request: Request,
    session: Session = Depends(get_session),
    state: Optional[str] = None,
    country_code: str = Query("MLB", description="Código do país (MLB, MLA, MLM, etc.)"),
    scope: str = Query("offline_access read write", description="Scopes solicitados")
):
    """
    Inicia processo de autenticação OAuth2 com Mercado Livre.
    
    Implementa todas as práticas de segurança:
    - PKCE (Proof Key for Code Exchange)
    - State seguro para prevenir CSRF
    - Rate limiting
    - Logging de segurança
    """
    try:
        # Validação de segurança
        await ml_oauth_service.validate_request_security(request, "oauth_authorize")
        
        # Gera state seguro se não fornecido
        if not state:
            state = PKCEConfig.generate_secure_state()
        
        # Gera PKCE
        code_verifier = PKCEConfig.generate_code_verifier()
        code_challenge = PKCEConfig.generate_code_challenge(code_verifier)
        
        # Salva sessão OAuth
        save_oauth_session(
            session=session,
            state=state,
            code_verifier=code_verifier
        )
        
        # Cria requisição OAuth
        oauth_request = OAuthRequest(
            client_id=settings.ml_client_id,
            client_secret=settings.ml_client_secret,
            redirect_uri=settings.ml_redirect_uri,
            scope=scope,
            country_code=country_code
        )
        
        # Constrói URL de autorização
        authorization_url = ml_oauth_service.build_authorization_url(
            oauth_request=oauth_request,
            state=state,
            code_challenge=code_challenge
        )
        
        # Log de segurança
        client_ip = await ml_oauth_service.get_client_ip(request)
        security_logger.log_auth_attempt(None, True, client_ip, request.headers.get("user-agent", ""))
        
        logger.info(f"OAuth login iniciado - State: {state[:8]}... - Country: {country_code}")
        
        return RedirectResponse(authorization_url)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no OAuth login: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no processo de autenticação")

@router.get("/callback")
async def oauth_callback(
    request: Request,
    session: Session = Depends(get_session),
    code: Optional[str] = Query(None, description="Código de autorização"),
    state: Optional[str] = Query(None, description="State de segurança"),
    error: Optional[str] = Query(None, description="Erro retornado pelo ML"),
    error_description: Optional[str] = Query(None, description="Descrição do erro")
):
    """
    Callback OAuth2 - recebe código de autorização e troca por access token.
    
    Implementa validações de segurança completas.
    """
    try:
        # Validação de segurança
        await ml_oauth_service.validate_request_security(request, "oauth_token")
        
        client_ip = await ml_oauth_service.get_client_ip(request)
        
        # Verifica se houve erro
        if error:
            security_logger.log_security_violation(
                "OAUTH_ERROR", 
                f"Error: {error} - {error_description}",
                client_ip
            )
            raise HTTPException(
                status_code=400, 
                detail=f"Erro de autorização: {error_description or error}"
            )
        
        # Valida parâmetros obrigatórios
        if not code or not state:
            security_logger.log_security_violation(
                "OAUTH_MISSING_PARAMS", 
                f"Code: {bool(code)} - State: {bool(state)}",
                client_ip
            )
            raise HTTPException(
                status_code=400, 
                detail="Código ou state ausente"
            )
        
        # Recupera sessão OAuth
        oauth_session = get_oauth_session(session=session, state=state)
        if not oauth_session:
            security_logger.log_security_violation(
                "OAUTH_INVALID_STATE", 
                f"State inválido: {state}",
                client_ip
            )
            raise HTTPException(
                status_code=400, 
                detail="State inválido ou expirado"
            )
        
        # Verifica expiração da sessão
        if oauth_session.expires_at and oauth_session.expires_at < datetime.now():
            delete_oauth_session(session=session, state=state)
            security_logger.log_security_violation(
                "OAUTH_EXPIRED_SESSION", 
                f"Sessão expirada: {state}",
                client_ip
            )
            raise HTTPException(
                status_code=400, 
                detail="Sessão OAuth expirada"
            )
        
        # Cria requisição OAuth
        oauth_request = OAuthRequest(
            client_id=settings.ml_client_id,
            client_secret=settings.ml_client_secret,
            redirect_uri=settings.ml_redirect_uri,
            scope="offline_access read write"
        )
        
        # Troca código por token
        token_response = await ml_oauth_service.exchange_code_for_token(
            code=code,
            oauth_request=oauth_request,
            code_verifier=oauth_session.code_verifier
        )
        
        # Remove sessão OAuth temporária
        delete_oauth_session(session=session, state=state)
        
        # Salva token no banco
        oauth_token = save_token_to_db(
            tokens=token_response.dict(),
            user_id=token_response.user_id,
            session=session
        )
        
        # Log de sucesso
        security_logger.log_auth_attempt(
            str(token_response.user_id), 
            True, 
            client_ip, 
            request.headers.get("user-agent", "")
        )
        
        logger.info(f"OAuth callback sucesso - User: {token_response.user_id}")
        
        return JSONResponse({
            "status": "success",
            "message": "Autorização concedida com sucesso",
            "user_id": token_response.user_id,
            "scope": token_response.scope,
            "expires_at": token_response.expires_at.isoformat()
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no OAuth callback: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no processo de autorização")

@router.post("/refresh")
async def refresh_token(
    request: Request,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Atualiza access token usando refresh token.
    """
    try:
        # Validação de segurança
        await ml_oauth_service.validate_request_security(request, "token_refresh")
        
        # Extrai refresh token do header Authorization
        refresh_token = credentials.credentials
        
        # Busca token atual no banco
        current_token = get_valid_token(session, user_id=None)  # Implementar busca por refresh token
        if not current_token:
            raise HTTPException(status_code=401, detail="Token não encontrado")
        
        # Atualiza token
        new_token_response = await ml_oauth_service.refresh_access_token(
            refresh_token=refresh_token,
            client_id=settings.ml_client_id,
            client_secret=settings.ml_client_secret
        )
        
        # Atualiza no banco
        updated_token = save_token_to_db(
            tokens=new_token_response.dict(),
            user_id=new_token_response.user_id,
            session=session
        )
        
        # Log de sucesso
        security_logger.log_token_refresh(str(new_token_response.user_id), True)
        
        return JSONResponse({
            "status": "success",
            "message": "Token atualizado com sucesso",
            "access_token": new_token_response.access_token,
            "expires_at": new_token_response.expires_at.isoformat()
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no refresh de token: {e}")
        security_logger.log_token_refresh("unknown", False)
        raise HTTPException(status_code=500, detail="Erro interno no refresh do token")

@router.delete("/revoke")
async def revoke_token(
    request: Request,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Revoga tokens de acesso.
    """
    try:
        access_token = credentials.credentials
        
        # Valida token para obter user_id
        user_info = await ml_oauth_service.validate_token_with_ml(access_token)
        user_id = user_info.get("id")
        
        # Remove tokens do banco
        delete_user_tokens(session, user_id)
        
        # Revoga no Mercado Livre (se aplicável)
        await ml_oauth_service.revoke_token(access_token)
        
        logger.info(f"Tokens revogados para usuário: {user_id}")
        
        return JSONResponse({
            "status": "success",
            "message": "Tokens revogados com sucesso"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao revogar token: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao revogar token")

@router.get("/status")
async def oauth_status(
    session: Session = Depends(get_session),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Verifica status da autenticação OAuth.
    """
    try:
        if not credentials:
            return JSONResponse({
                "authenticated": False,
                "message": "Token não fornecido"
            })
        
        access_token = credentials.credentials
        
        # Valida token com Mercado Livre
        user_info = await ml_oauth_service.validate_token_with_ml(access_token)
        
        return JSONResponse({
            "authenticated": True,
            "user_id": user_info.get("id"),
            "nickname": user_info.get("nickname"),
            "email": user_info.get("email"),
            "country_id": user_info.get("country_id"),
            "site_id": user_info.get("site_id")
        })
        
    except HTTPException as e:
        return JSONResponse({
            "authenticated": False,
            "message": str(e.detail)
        })
    except Exception as e:
        logger.error(f"Erro ao verificar status OAuth: {e}")
        return JSONResponse({
            "authenticated": False,
            "message": "Erro interno"
        })

@router.post("/test-user")
async def create_test_user(
    request: Request,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    site_id: str = Form("MLB", description="Site ID para o usuário de teste")
):
    """
    Cria usuário de teste para desenvolvimento.
    """
    try:
        access_token = credentials.credentials
        
        # Cria usuário de teste
        test_user = await ml_oauth_service.create_test_user(access_token, site_id)
        
        logger.info(f"Usuário de teste criado: {test_user.get('id')}")
        
        return JSONResponse({
            "status": "success",
            "test_user": test_user,
            "message": "Usuário de teste criado com sucesso"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar usuário de teste: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar usuário de teste")

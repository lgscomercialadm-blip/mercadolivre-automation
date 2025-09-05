"""
Configuração completa do OAuth2 para Mercado Livre seguindo todas as boas práticas de segurança.
"""

import os
import secrets
import hashlib
import base64
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, validator
import logging

logger = logging.getLogger(__name__)

class MercadoLivreConfig:
    """Configuração segura para integração com Mercado Livre."""
    
    def __init__(self):
        # URLs base por país
        self.AUTH_URLS = {
            "MLB": "https://auth.mercadolivre.com.br",  # Brasil
            "MLA": "https://auth.mercadolibre.com.ar",  # Argentina  
            "MLM": "https://auth.mercadolibre.com.mx",  # México
            "MLU": "https://auth.mercadolibre.com.uy",  # Uruguai
            "MLC": "https://auth.mercadolibre.cl",      # Chile
            "MCO": "https://auth.mercadolibre.com.co",  # Colômbia
            "MPE": "https://auth.mercadolibre.com.pe",  # Peru
        }
        
        self.API_BASE_URL = "https://api.mercadolibre.com"
        
        # Configurações de segurança
        self.TOKEN_EXPIRE_TIME = 21600  # 6 horas
        self.REFRESH_TOKEN_EXPIRE_TIME = 15552000  # 6 meses
        self.STATE_EXPIRE_TIME = 600  # 10 minutos
        
        # Scopes disponíveis
        self.AVAILABLE_SCOPES = ["offline_access", "read", "write"]
        
        # Configurações PKCE
        self.CODE_VERIFIER_LENGTH = 128
        self.CODE_CHALLENGE_METHOD = "S256"
        
    def get_auth_url(self, country_code: str = "MLB") -> str:
        """Retorna URL de autenticação para o país específico."""
        return self.AUTH_URLS.get(country_code, self.AUTH_URLS["MLB"])

class PKCEConfig:
    """Configuração PKCE (Proof Key for Code Exchange) para máxima segurança."""
    
    @staticmethod
    def generate_code_verifier() -> str:
        """Gera code_verifier seguro usando SecureRandom."""
        return base64.urlsafe_b64encode(secrets.token_bytes(96)).decode('utf-8').rstrip('=')
    
    @staticmethod
    def generate_code_challenge(code_verifier: str) -> str:
        """Gera code_challenge usando SHA256."""
        digest = hashlib.sha256(code_verifier.encode('utf-8')).digest()
        return base64.urlsafe_b64encode(digest).decode('utf-8').rstrip('=')
    
    @staticmethod
    def generate_secure_state() -> str:
        """Gera state seguro para prevenir CSRF."""
        return secrets.token_urlsafe(32)

class OAuthRequest(BaseModel):
    """Modelo para requisições OAuth com validações de segurança."""
    
    client_id: str
    client_secret: str
    redirect_uri: str
    scope: str = "offline_access read write"
    country_code: str = "MLB"
    
    @validator('redirect_uri')
    def validate_redirect_uri(cls, v):
        """Valida se redirect_uri está usando HTTPS em produção."""
        if not v.startswith(('http://localhost', 'https://')):
            raise ValueError('redirect_uri deve usar HTTPS em produção ou localhost para desenvolvimento')
        return v
    
    @validator('scope')
    def validate_scope(cls, v):
        """Valida se scopes são válidos."""
        config = MercadoLivreConfig()
        scopes = v.split()
        for scope in scopes:
            if scope not in config.AVAILABLE_SCOPES:
                raise ValueError(f'Scope inválido: {scope}')
        return v

class TokenResponse(BaseModel):
    """Resposta do token OAuth com todas as informações necessárias."""
    
    access_token: str
    token_type: str
    expires_in: int
    scope: str
    user_id: int
    refresh_token: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SecurityLogger:
    """Logger específico para eventos de segurança."""
    
    def __init__(self):
        self.logger = logging.getLogger('security.oauth')
        
    def log_auth_attempt(self, user_id: Optional[str], success: bool, ip: str, user_agent: str):
        """Log de tentativas de autenticação."""
        status = "SUCCESS" if success else "FAILED"
        self.logger.info(f"AUTH_ATTEMPT: {status} - User: {user_id} - IP: {ip} - UA: {user_agent}")
        
    def log_token_refresh(self, user_id: str, success: bool):
        """Log de refresh de tokens."""
        status = "SUCCESS" if success else "FAILED"
        self.logger.info(f"TOKEN_REFRESH: {status} - User: {user_id}")
        
    def log_security_violation(self, event: str, details: str, ip: str):
        """Log de violações de segurança."""
        self.logger.warning(f"SECURITY_VIOLATION: {event} - Details: {details} - IP: {ip}")

class RateLimiter:
    """Rate limiting para prevenir ataques de força bruta."""
    
    def __init__(self):
        self.attempts = {}
        self.blocked_ips = {}
        
    def is_rate_limited(self, ip: str, endpoint: str) -> bool:
        """Verifica se IP está sendo rate limited."""
        key = f"{ip}:{endpoint}"
        now = datetime.now()
        
        # Remove tentativas antigas (janela de 1 hora)
        if key in self.attempts:
            self.attempts[key] = [
                attempt for attempt in self.attempts[key] 
                if now - attempt < timedelta(hours=1)
            ]
        
        # Verifica se IP está bloqueado
        if ip in self.blocked_ips:
            if now < self.blocked_ips[ip]:
                return True
            else:
                del self.blocked_ips[ip]
        
        # Verifica limite de tentativas
        attempts_count = len(self.attempts.get(key, []))
        
        # Diferentes limites por endpoint
        limits = {
            "oauth_token": 10,      # 10 tentativas por hora
            "oauth_authorize": 5,   # 5 tentativas por hora
            "token_refresh": 20,    # 20 tentativas por hora
        }
        
        limit = limits.get(endpoint, 10)
        
        if attempts_count >= limit:
            # Bloqueia IP por 1 hora
            self.blocked_ips[ip] = now + timedelta(hours=1)
            return True
            
        return False
    
    def record_attempt(self, ip: str, endpoint: str):
        """Registra tentativa de acesso."""
        key = f"{ip}:{endpoint}"
        if key not in self.attempts:
            self.attempts[key] = []
        self.attempts[key].append(datetime.now())

# Instâncias globais
ml_config = MercadoLivreConfig()
security_logger = SecurityLogger()
rate_limiter = RateLimiter()

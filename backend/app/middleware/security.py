"""
Middleware de segurança implementando todas as práticas de cybersecurity do Mercado Livre.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from starlette.types import ASGIApp
import time
import hashlib
import secrets
from typing import Dict, Set, Optional
from datetime import datetime, timedelta
import logging
import json
import re

logger = logging.getLogger("security.middleware")

class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Middleware de segurança completo implementando:
    - Rate limiting
    - Request validation
    - Security headers
    - IP blocking
    - Request logging
    - CORS security
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        
        # Rate limiting storage
        self.request_counts: Dict[str, list] = {}
        self.blocked_ips: Set[str] = set()
        self.blocked_until: Dict[str, datetime] = {}
        
        # Security configurations
        self.rate_limits = {
            "/api/oauth/login": {"requests": 5, "window": 3600},      # 5 por hora
            "/api/oauth/callback": {"requests": 10, "window": 3600},  # 10 por hora
            "/api/oauth/refresh": {"requests": 20, "window": 3600},   # 20 por hora
            "/api/auth/register": {"requests": 3, "window": 3600},    # 3 por hora
            "/api/auth/token": {"requests": 10, "window": 3600},      # 10 por hora
            "default": {"requests": 100, "window": 3600}              # 100 por hora
        }
        
        # Suspicious patterns
        self.suspicious_patterns = [
            r"<script.*?>.*?</script>",  # XSS
            r"union.*select",            # SQL Injection
            r"javascript:",              # JavaScript injection
            r"eval\(",                   # Code injection
            r"exec\(",                   # Code injection
            r"\.\./",                    # Path traversal
        ]
        
        # Security headers
        self.security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
    
    def get_client_ip(self, request: Request) -> str:
        """Extrai o IP real do cliente."""
        # Verifica headers de proxy
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
            
        return request.client.host if request.client else "unknown"
    
    def is_ip_blocked(self, ip: str) -> bool:
        """Verifica se IP está bloqueado."""
        if ip in self.blocked_ips:
            # Verifica se ainda está no período de bloqueio
            if ip in self.blocked_until:
                if datetime.now() < self.blocked_until[ip]:
                    return True
                else:
                    # Remove do bloqueio
                    self.blocked_ips.discard(ip)
                    self.blocked_until.pop(ip, None)
        return False
    
    def block_ip(self, ip: str, duration_minutes: int = 60):
        """Bloqueia IP por período específico."""
        self.blocked_ips.add(ip)
        self.blocked_until[ip] = datetime.now() + timedelta(minutes=duration_minutes)
        logger.warning(f"IP bloqueado: {ip} por {duration_minutes} minutos")
    
    def check_rate_limit(self, ip: str, path: str) -> bool:
        """Verifica rate limiting."""
        now = datetime.now()
        
        # Determina limite para o endpoint
        limit_config = self.rate_limits.get(path, self.rate_limits["default"])
        max_requests = limit_config["requests"]
        window_seconds = limit_config["window"]
        
        # Chave única para IP + endpoint
        key = f"{ip}:{path}"
        
        # Inicializa se não existe
        if key not in self.request_counts:
            self.request_counts[key] = []
        
        # Remove requests antigas
        cutoff_time = now - timedelta(seconds=window_seconds)
        self.request_counts[key] = [
            req_time for req_time in self.request_counts[key] 
            if req_time > cutoff_time
        ]
        
        # Verifica se excedeu limite
        if len(self.request_counts[key]) >= max_requests:
            return False
        
        # Adiciona request atual
        self.request_counts[key].append(now)
        return True
    
    def detect_suspicious_content(self, content: str) -> bool:
        """Detecta conteúdo suspeito."""
        content_lower = content.lower()
        
        for pattern in self.suspicious_patterns:
            if re.search(pattern, content_lower, re.IGNORECASE):
                return True
        
        return False
    
    def validate_request_security(self, request: Request) -> Optional[JSONResponse]:
        """Valida segurança da requisição."""
        client_ip = self.get_client_ip(request)
        path = request.url.path
        
        # Verifica IP bloqueado
        if self.is_ip_blocked(client_ip):
            logger.warning(f"Request de IP bloqueado: {client_ip}")
            return JSONResponse(
                status_code=403,
                content={"error": "IP bloqueado por violação de segurança"}
            )
        
        # Verifica rate limiting
        if not self.check_rate_limit(client_ip, path):
            logger.warning(f"Rate limit excedido: {client_ip} - {path}")
            # Bloqueia IP após muitas tentativas
            self.block_ip(client_ip, 30)  # 30 minutos
            return JSONResponse(
                status_code=429,
                content={"error": "Muitas requisições. Tente novamente mais tarde."}
            )
        
        # Verifica tamanho da requisição
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB
            logger.warning(f"Request muito grande: {client_ip} - {content_length}")
            return JSONResponse(
                status_code=413,
                content={"error": "Requisição muito grande"}
            )
        
        # Verifica User-Agent suspeito
        user_agent = request.headers.get("user-agent", "")
        if not user_agent or len(user_agent) < 10:
            logger.warning(f"User-Agent suspeito: {client_ip} - {user_agent}")
            return JSONResponse(
                status_code=400,
                content={"error": "User-Agent inválido"}
            )
        
        return None
    
    async def log_request(self, request: Request, response_status: int, processing_time: float):
        """Log detalhado da requisição."""
        client_ip = self.get_client_ip(request)
        
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "ip": client_ip,
            "method": request.method,
            "path": request.url.path,
            "status": response_status,
            "processing_time": processing_time,
            "user_agent": request.headers.get("user-agent", ""),
            "referer": request.headers.get("referer", ""),
        }
        
        # Log diferentes níveis baseado no status
        if response_status >= 500:
            logger.error(f"SERVER_ERROR: {json.dumps(log_data)}")
        elif response_status >= 400:
            logger.warning(f"CLIENT_ERROR: {json.dumps(log_data)}")
        else:
            logger.info(f"REQUEST: {json.dumps(log_data)}")
    
    async def dispatch(self, request: Request, call_next):
        """Processa middleware de segurança."""
        start_time = time.time()
        
        # Validações de segurança
        security_error = self.validate_request_security(request)
        if security_error:
            return security_error
        
        # Processa requisição
        try:
            response = await call_next(request)
        except Exception as e:
            logger.error(f"Erro no processamento da requisição: {e}")
            response = JSONResponse(
                status_code=500,
                content={"error": "Erro interno do servidor"}
            )
        
        # Adiciona headers de segurança
        for header, value in self.security_headers.items():
            response.headers[header] = value
        
        # Adiciona headers informativos
        processing_time = time.time() - start_time
        response.headers["X-Processing-Time"] = str(processing_time)
        response.headers["X-Request-ID"] = secrets.token_hex(16)
        
        # Log da requisição
        await self.log_request(request, response.status_code, processing_time)
        
        return response

class ValidationMiddleware(BaseHTTPMiddleware):
    """
    Middleware de validação de dados.
    """
    
    async def dispatch(self, request: Request, call_next):
        """Valida dados da requisição."""
        
        # Apenas para requests com body
        if request.method in ["POST", "PUT", "PATCH"]:
            # Lê body se presente
            body = await request.body()
            
            if body:
                try:
                    # Tenta parsear JSON se Content-Type indica
                    content_type = request.headers.get("content-type", "")
                    if "application/json" in content_type:
                        json_data = json.loads(body.decode("utf-8"))
                        
                        # Validações básicas de segurança
                        json_str = json.dumps(json_data)
                        
                        # Detecta patterns suspeitos
                        security_middleware = SecurityMiddleware(None)
                        if security_middleware.detect_suspicious_content(json_str):
                            logger.warning(f"Conteúdo suspeito detectado: {request.url.path}")
                            return JSONResponse(
                                status_code=400,
                                content={"error": "Conteúdo da requisição inválido"}
                            )
                        
                except json.JSONDecodeError:
                    # JSON inválido
                    logger.warning(f"JSON inválido recebido: {request.url.path}")
                    return JSONResponse(
                        status_code=400,
                        content={"error": "Formato JSON inválido"}
                    )
                except Exception as e:
                    logger.error(f"Erro na validação: {e}")
        
        response = await call_next(request)
        return response

def setup_security_middleware(app: FastAPI):
    """Configura middlewares de segurança na aplicação."""
    
    # Adiciona middleware de validação
    app.add_middleware(ValidationMiddleware)
    
    # Adiciona middleware de segurança principal
    app.add_middleware(SecurityMiddleware)
    
    logger.info("✅ Middlewares de segurança configurados")

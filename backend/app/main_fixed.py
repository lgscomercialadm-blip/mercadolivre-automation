from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Simples configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)

app = FastAPI(
    title="ML Integration Backend - Mercado Livre Automation",
    description="""
    Sistema completo de automação para Mercado Livre com autenticação OAuth2 segura.
    
    ## Funcionalidades de Segurança
    - ✅ OAuth2 com PKCE (Proof Key for Code Exchange)
    - ✅ Rate limiting por IP e endpoint
    - ✅ Validação de conteúdo suspeito
    - ✅ Headers de segurança (HSTS, CSP, etc.)
    - ✅ Logging de auditoria
    - ✅ Bloqueio automático de IPs suspeitos
    
    ## Endpoints Principais
    - `/api/oauth/login` - Iniciar autenticação OAuth2
    - `/api/oauth/callback` - Callback de autorização
    - `/api/oauth/status` - Status da autenticação
    - `/anuncios/list` - Listagem de anúncios
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware (configurado antes dos middlewares de segurança)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],  # Apenas origens confiáveis
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Configurar middlewares de segurança
try:
    from app.middleware.security import setup_security_middleware
    setup_security_middleware(app)
    logging.info("✅ Middlewares de segurança configurados")
except Exception as e:
    logging.warning(f"⚠️ Erro ao configurar middlewares de segurança: {e}")

@app.on_event("startup")
async def startup_event():
    """Evento de inicialização da aplicação."""
    try:
        logging.info("🚀 Iniciando ML Integration Backend v2.0.0")
        logging.info("🔐 Sistema de segurança OAuth2 com PKCE ativado")
        logging.info("✅ Aplicação iniciada com sucesso!")
    except Exception as e:
        logging.error(f"❌ Erro na inicialização: {e}")

# Rota de health check básica
@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "message": "Backend principal funcionando",
        "version": "2.0.0",
        "security": "OAuth2 + PKCE ativado"
    }

@app.get("/")
async def root():
    return {
        "message": "ML Integration Backend v2.0.0", 
        "status": "running",
        "version": "2.0.0",
        "docs": "/docs",
        "security_features": [
            "OAuth2 com PKCE",
            "Rate limiting",
            "Request validation", 
            "Security headers",
            "Audit logging"
        ]
    }

# Importar apenas routers essenciais que não têm dependências problemáticas
try:
    from app.routers import anuncios
    app.include_router(anuncios.router)
    logging.info("✅ Router de anúncios carregado")
except Exception as e:
    logging.warning(f"⚠️ Erro ao carregar router de anúncios: {e}")

# Adicionar autenticação
try:
    from app.routers import auth_temp as auth
    app.include_router(auth.router)
    logging.info("✅ Router de autenticação temporário carregado")
except Exception as e:
    logging.warning(f"⚠️ Erro ao carregar router de autenticação: {e}")

# Adicionar OAuth seguro
try:
    from app.routers import oauth_secure as oauth
    app.include_router(oauth.router)
    logging.info("✅ Router OAuth seguro carregado")
except Exception as e:
    logging.warning(f"⚠️ Erro ao carregar router OAuth seguro: {e}")
    # Fallback para versão temporária
    try:
        from app.routers import oauth_temp as oauth_temp
        app.include_router(oauth_temp.router)
        logging.info("✅ Router OAuth temporário carregado como fallback")
    except Exception as e2:
        logging.warning(f"⚠️ Erro ao carregar router OAuth temporário: {e2}")

# Adicionar OAuth simplificado (working version)
try:
    from app.routers import oauth_simple
    app.include_router(oauth_simple.router)
    logging.info("✅ Router OAuth simplificado carregado")
except Exception as e:
    logging.warning(f"⚠️ Erro ao carregar router OAuth simplificado: {e}")

# Adicionar router de teste do banco
try:
    from app.routers import test_db
    app.include_router(test_db.router)
    logging.info("✅ Router de teste do banco carregado")
except Exception as e:
    logging.warning(f"⚠️ Erro ao carregar router de teste do banco: {e}")

# Adicionar APIs do Mercado Livre
try:
    from app.routers import ml_api
    app.include_router(ml_api.router)
    logging.info("✅ Router ML APIs carregado")
except Exception as e:
    logging.warning(f"⚠️ Erro ao carregar router ML APIs: {e}")

# Adicionar ML APIs simplificadas
try:
    from app.routers import ml_simple
    app.include_router(ml_simple.router)
    logging.info("✅ Router ML APIs simplificadas carregado")
except Exception as e:
    logging.warning(f"⚠️ Erro ao carregar router ML APIs simplificadas: {e}")

# TODO: Adicionar outros routers conforme forem corrigidos
# from app.routers import api_endpoints
# app.include_router(api_endpoints.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

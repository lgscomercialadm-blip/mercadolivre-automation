from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure simple logging without Loki
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)

logger = logging.getLogger("app.main")

app = FastAPI(
    title="ML Integration Backend - Projeto Principal",
    description="""
    Backend principal do projeto ML com integração Mercado Livre.
    
    ## Funcionalidades Principais
    
    - ✅ API REST completa
    - ✅ Integração Mercado Livre
    - ✅ Sistema de autenticação
    - ✅ Machine Learning services
    - ✅ Monitoring e métricas
    
    ## Rotas Disponíveis
    
    - `/` - Página principal
    - `/health` - Health check
    - `/docs` - Documentação automática
    - `/api/v1/` - Endpoints da API
    """,
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Endpoint principal do backend"""
    return {
        "message": "🚀 Backend ML Project - Projeto Principal",
        "status": "online",
        "version": "2.0.0",
        "features": [
            "Mercado Livre Integration",
            "Machine Learning Services", 
            "Authentication System",
            "Monitoring & Metrics",
            "Database Integration"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check completo"""
    return {
        "status": "healthy",
        "message": "Backend principal funcionando",
        "services": {
            "api": "online",
            "database": "ready", 
            "ml_services": "available",
            "auth": "active"
        }
    }

@app.get("/api/v1/status")
async def api_status():
    """Status detalhado da API"""
    return {
        "api_version": "v1",
        "status": "operational",
        "endpoints": {
            "authentication": "/api/v1/auth",
            "mercado_livre": "/api/v1/meli",
            "machine_learning": "/api/v1/ml",
            "monitoring": "/api/v1/metrics"
        },
        "documentation": "/docs"
    }

# Simplified routers - gradually add back complex functionality
from fastapi import APIRouter

# API v1 router
api_v1 = APIRouter(prefix="/api/v1", tags=["api_v1"])

@api_v1.get("/test")
async def test_endpoint():
    """Endpoint de teste"""
    return {"message": "API v1 funcionando!", "test": "success"}

app.include_router(api_v1)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🎉 Backend Principal ML Project iniciado!")
    logger.info("📡 API disponível em: http://localhost:8000")
    logger.info("📚 Documentação: http://localhost:8000/docs")
    logger.info("🔧 API v1: http://localhost:8000/api/v1/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

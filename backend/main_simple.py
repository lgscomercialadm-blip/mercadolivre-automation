from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ML Project Backend - Simplified",
    description="Backend simplificado para o projeto ML",
    version="1.0.0"
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
    """Endpoint principal"""
    return {
        "message": "🚀 Backend ML Project funcionando!",
        "status": "success",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Backend está funcionando corretamente"
    }

@app.get("/api/status")
async def api_status():
    """Status da API"""
    return {
        "api_status": "online",
        "endpoints_available": [
            "/",
            "/health", 
            "/api/status",
            "/docs",
            "/redoc"
        ]
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🎉 Backend ML Project iniciado com sucesso!")
    logger.info("📡 API disponível em: http://localhost:8001")
    logger.info("📚 Documentação: http://localhost:8001/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

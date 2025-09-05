#!/usr/bin/env python3
"""
Servidor FastAPI simples para teste das dependências.
Este servidor básico serve para verificar se o ambiente está funcionando.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Criar aplicação FastAPI
app = FastAPI(
    title="ML Project - Test Server",
    description="Servidor de teste para verificar dependências",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Endpoint raiz - Health check"""
    return {
        "message": "🚀 Servidor ML Project funcionando!",
        "status": "success",
        "environment": "test"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ml-project-backend",
        "version": "1.0.0"
    }

@app.get("/dependencies")
async def check_dependencies():
    """Verificar se as principais dependências estão disponíveis"""
    deps_status = {}
    
    try:
        import fastapi
        deps_status["fastapi"] = fastapi.__version__
    except ImportError:
        deps_status["fastapi"] = "❌ Não instalado"
    
    try:
        import pydantic
        deps_status["pydantic"] = pydantic.__version__
    except ImportError:
        deps_status["pydantic"] = "❌ Não instalado"
    
    try:
        import sqlalchemy
        deps_status["sqlalchemy"] = sqlalchemy.__version__
    except ImportError:
        deps_status["sqlalchemy"] = "❌ Não instalado"
    
    try:
        import torch
        deps_status["torch"] = torch.__version__
    except ImportError:
        deps_status["torch"] = "❌ Não instalado"
    
    try:
        import transformers
        deps_status["transformers"] = transformers.__version__
    except ImportError:
        deps_status["transformers"] = "❌ Não instalado"
    
    return {
        "message": "Status das dependências",
        "dependencies": deps_status
    }

if __name__ == "__main__":
    print("🚀 Iniciando servidor de teste...")
    print("📍 URL: http://localhost:8000")
    print("📖 Docs: http://localhost:8000/docs")
    
    uvicorn.run(
        "test_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

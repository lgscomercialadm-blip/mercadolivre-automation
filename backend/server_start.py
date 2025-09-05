#!/usr/bin/env python3
"""
Servidor de inicialização para FastAPI com configuração personalizada
"""
import sys
import os
from pathlib import Path

# Adiciona o diretório backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    import uvicorn
    from app.main_fixed import app
    
    if __name__ == "__main__":
        print("=" * 60)
        print("🚀 INICIANDO SERVIDOR FASTAPI ML INTELLIGENCE")
        print("=" * 60)
        print(f"📁 Diretório backend: {backend_dir}")
        print(f"🐍 Python Path: {sys.path[:2]}")
        print("🔗 Endpoints disponíveis:")
        print("   • http://localhost:8000/")
        print("   • http://localhost:8000/docs")
        print("   • http://localhost:8000/api/oauth/login")
        print("   • http://localhost:8000/api/oauth/status")
        print("=" * 60)
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )

except ImportError as e:
    print(f"❌ Erro de importação: {e}")
    print("💡 Certifique-se de que todas as dependências estão instaladas:")
    print("   pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro inesperado: {e}")
    sys.exit(1)

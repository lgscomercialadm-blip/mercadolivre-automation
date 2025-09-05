#!/usr/bin/env python3
"""
Script para iniciar o servidor OAuth2
"""

import sys
import os
from pathlib import Path

# Adicionar backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    try:
        print("🚀 INICIANDO SERVIDOR OAUTH2 - MARKETINTELLIGENCE.PRO")
        print("="*60)
        
        # Import da aplicação
        from app.main_fixed import app
        
        # Import do uvicorn
        import uvicorn
        
        print("✅ Aplicação carregada com sucesso")
        print("🔗 Endpoints OAuth2 disponíveis:")
        print("  • GET  /api/oauth/login")
        print("  • GET  /api/oauth/callback") 
        print("  • POST /api/oauth/refresh")
        print("  • DELETE /api/oauth/revoke")
        print("  • GET  /api/oauth/status")
        print("  • POST /api/oauth/test-user")
        print("")
        print("📖 Documentação: http://localhost:8000/docs")
        print("🔍 Redoc: http://localhost:8000/redoc")
        print("")
        print("🔐 Configuração OAuth2:")
        from app.settings import settings
        print(f"  • Client ID: {settings.ml_client_id}")
        print(f"  • Redirect URI: {settings.ml_redirect_uri}")
        print(f"  • Environment: {settings.env}")
        print("")
        print("⏳ Iniciando servidor em http://localhost:8000...")
        print("Press CTRL+C to quit")
        print("")
        
        # Iniciar servidor
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor parado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro ao iniciar servidor: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

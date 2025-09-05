#!/usr/bin/env python3
"""
Teste simples de imports para verificar configuração
"""

import sys
import os
from pathlib import Path

# Adicionar backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

print("🔍 TESTE DE IMPORTS - OAUTH2 SYSTEM")
print("="*50)

try:
    print("✅ Testando import FastAPI...")
    from fastapi import FastAPI
    print("✅ FastAPI OK")
    
    print("✅ Testando settings...")
    from app.settings import settings
    print(f"✅ Settings OK - ENV: {settings.env}")
    
    print("✅ Testando main_fixed...")
    from app.main_fixed import app
    print("✅ App OK")
    
    print("✅ Testando OAuth core...")
    from app.core.mercadolivre_oauth import MercadoLivreConfig
    print("✅ OAuth Core OK")
    
    print("✅ Testando OAuth service...")
    from app.services.mercadolivre_oauth import MercadoLivreOAuthService
    print("✅ OAuth Service OK")
    
    print("✅ Testando OAuth router...")
    from app.routers.oauth_secure import router
    print("✅ OAuth Router OK")
    
    print("\n🎉 TODOS OS IMPORTS OK!")
    print("✅ Sistema está pronto para execução")
    
    # Testar configurações OAuth
    print("\n📋 CONFIGURAÇÕES OAUTH:")
    print(f"Client ID: {settings.ml_client_id}")
    print(f"Redirect URI: {settings.ml_redirect_uri}")
    print(f"Base URL: {settings.app_base_url}")
    print(f"Environment: {settings.env}")
    
except ImportError as e:
    print(f"❌ Erro de import: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro geral: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n🚀 PRONTO PARA INICIAR SERVIDOR!")
print("Execute: uvicorn app.main_fixed:app --reload --port 8000")

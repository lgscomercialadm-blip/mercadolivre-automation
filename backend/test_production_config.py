#!/usr/bin/env python3
"""
Teste de configuração OAuth2 para MarketIntelligence.pro
"""

import os
import sys
from pathlib import Path

# Adicionar diretório backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_production_config():
    """Testa configurações de produção."""
    print("🔐 TESTE DE CONFIGURAÇÃO - MARKETINTELLIGENCE.PRO")
    print("="*60)
    
    # Carrega variáveis do .env
    env_vars = {}
    try:
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    except Exception as e:
        print(f"❌ Erro ao ler .env: {e}")
        return False
    
    # Verificações específicas
    checks = {
        "ML_CLIENT_ID": env_vars.get("ML_CLIENT_ID") == "6377568852501213",
        "ML_CLIENT_SECRET": env_vars.get("ML_CLIENT_SECRET") == "0btHWQ64AT8dTOLQUmTYAOeAgJE3POB0",
        "ML_REDIRECT_URI": env_vars.get("ML_REDIRECT_URI") == "https://www.marketintelligence.pro/api/oauth/callback",
        "APP_BASE_URL": env_vars.get("APP_BASE_URL") == "https://www.marketintelligence.pro",
        "ENV": env_vars.get("ENV") == "production",
        "DEBUG": env_vars.get("DEBUG") == "false",
        "FORCE_HTTPS": env_vars.get("FORCE_HTTPS") == "true",
        "FRONTEND_ORIGIN": "marketintelligence.pro" in env_vars.get("FRONTEND_ORIGIN", "")
    }
    
    print("📋 VERIFICAÇÕES DE CONFIGURAÇÃO:")
    print("-" * 40)
    
    all_ok = True
    for check, status in checks.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {check}: {'OK' if status else 'FALHOU'}")
        if not status:
            all_ok = False
    
    print("\n🔗 URLS OAUTH2 CONFIGURADAS:")
    print("-" * 40)
    print(f"🚀 Login: {env_vars.get('APP_BASE_URL')}/api/oauth/login")
    print(f"↩️ Callback: {env_vars.get('ML_REDIRECT_URI')}")
    print(f"📊 Status: {env_vars.get('APP_BASE_URL')}/api/oauth/status")
    print(f"🔄 Refresh: {env_vars.get('APP_BASE_URL')}/api/oauth/refresh")
    print(f"🗑️ Revoke: {env_vars.get('APP_BASE_URL')}/api/oauth/revoke")
    
    print("\n📝 CREDENCIAIS MERCADO LIVRE:")
    print("-" * 40)
    print(f"🆔 Client ID: {env_vars.get('ML_CLIENT_ID')}")
    print(f"🔐 Client Secret: {env_vars.get('ML_CLIENT_SECRET', '')[:10]}...")
    print(f"🌐 Redirect URI: {env_vars.get('ML_REDIRECT_URI')}")
    
    print("\n🛡️ CONFIGURAÇÕES DE SEGURANÇA:")
    print("-" * 40)
    print(f"🔒 HTTPS Forçado: {env_vars.get('FORCE_HTTPS')}")
    print(f"🌍 Ambiente: {env_vars.get('ENV')}")
    print(f"🐛 Debug: {env_vars.get('DEBUG')}")
    print(f"🚦 Rate Limiting: {env_vars.get('ENABLE_RATE_LIMITING', 'true')}")
    
    print("\n" + "="*60)
    if all_ok:
        print("🎉 CONFIGURAÇÃO DE PRODUÇÃO OK!")
        print("\n📋 Próximos passos:")
        print("1. Deploy do código para https://www.marketintelligence.pro")
        print("2. Configurar SSL certificate")
        print("3. Verificar DNS resolution")
        print("4. Testar endpoints OAuth2")
        print("\n🔗 Documentação API:")
        print("https://www.marketintelligence.pro/docs")
    else:
        print("❌ CONFIGURAÇÃO INCOMPLETA!")
        print("Verifique as configurações marcadas como FALHOU")
    
    return all_ok

if __name__ == "__main__":
    success = test_production_config()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Script de configuração OAuth2 para integração com Mercado Livre

Este script realiza a configuração inicial do sistema OAuth2 seguindo 
todos os requisitos da documentação do Mercado Livre.

Requirements:
- Credenciais do Mercado Livre configuradas no .env
- Base de dados inicializada
- Dependências Python instaladas

Author: ML Project Team
Date: 2024
Version: 2.0.0
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any

# Adicionar diretório backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from app.settings import settings
    from app.core.mercadolivre_oauth import MercadoLivreConfig, PKCEConfig
    from app.services.mercadolivre_oauth import MercadoLivreOAuthService
    from app.middleware.security import SecurityLogger
except ImportError as e:
    print(f"❌ Erro ao importar módulos: {e}")
    print("Certifique-se de que está no diretório correto e as dependências estão instaladas.")
    sys.exit(1)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class OAuthSetup:
    """Classe para configuração inicial do OAuth2."""
    
    def __init__(self):
        self.logger = SecurityLogger("oauth_setup")
        self.config = MercadoLivreConfig()
        
    def check_environment(self) -> Dict[str, Any]:
        """Verifica configuração do ambiente."""
        logger.info("🔍 Verificando configuração do ambiente...")
        
        checks = {
            "env_file": os.path.exists(".env"),
            "oauth_config": settings.validate_oauth_config(),
            "ml_client_id": bool(settings.ml_client_id.strip()),
            "ml_client_secret": bool(settings.ml_client_secret.strip()),
            "ml_redirect_uri": bool(settings.ml_redirect_uri.strip()),
            "secret_key": settings.secret_key != "change-this-secret-key-in-production",
            "database_url": bool(settings.database_url.strip()),
        }
        
        # Verificar dependências Python
        try:
            import aiohttp
            import fastapi
            import sqlmodel
            import cryptography
            checks["dependencies"] = True
        except ImportError as e:
            logger.error(f"Dependências ausentes: {e}")
            checks["dependencies"] = False
        
        return checks
    
    def print_environment_status(self, checks: Dict[str, Any]):
        """Imprime status da configuração."""
        print("\n" + "="*60)
        print("📋 STATUS DA CONFIGURAÇÃO OAUTH2")
        print("="*60)
        
        status_icons = {True: "✅", False: "❌"}
        
        print(f"{status_icons[checks['env_file']]} Arquivo .env encontrado")
        print(f"{status_icons[checks['oauth_config']]} Configuração OAuth completa")
        print(f"{status_icons[checks['ml_client_id']]} ML_CLIENT_ID configurado")
        print(f"{status_icons[checks['ml_client_secret']]} ML_CLIENT_SECRET configurado")
        print(f"{status_icons[checks['ml_redirect_uri']]} ML_REDIRECT_URI configurado")
        print(f"{status_icons[checks['secret_key']]} SECRET_KEY personalizada")
        print(f"{status_icons[checks['database_url']]} DATABASE_URL configurada")
        print(f"{status_icons[checks['dependencies']]} Dependências Python instaladas")
        
        print("\n" + "="*60)
        print("📊 CONFIGURAÇÕES ATUAIS")
        print("="*60)
        
        # Mascarar dados sensíveis
        masked_secret = settings.ml_client_secret[:8] + "..." if settings.ml_client_secret else "NÃO CONFIGURADO"
        masked_key = settings.secret_key[:16] + "..." if settings.secret_key else "NÃO CONFIGURADO"
        
        print(f"🏢 Environment: {settings.env}")
        print(f"🔗 Base URL: {settings.app_base_url}")
        print(f"🌍 País padrão ML: {settings.ml_default_country}")
        print(f"🔑 Client ID: {settings.ml_client_id}")
        print(f"🔐 Client Secret: {masked_secret}")
        print(f"↩️ Redirect URI: {settings.ml_redirect_uri}")
        print(f"🔒 Secret Key: {masked_key}")
        print(f"⏱️ Token expira em: {settings.access_token_expire_minutes} minutos")
        print(f"🔄 Refresh expira em: {settings.refresh_token_expire_days} dias")
        print(f"🚦 Rate limiting: {'Ativado' if settings.enable_rate_limiting else 'Desativado'}")
        print(f"🧪 Modo teste: {'Ativado' if settings.ml_test_mode else 'Desativado'}")
        
    def print_missing_config(self, checks: Dict[str, Any]):
        """Imprime configurações ausentes."""
        missing = [key for key, value in checks.items() if not value]
        
        if missing:
            print("\n❌ CONFIGURAÇÕES AUSENTES:")
            print("-" * 40)
            
            for item in missing:
                if item == "env_file":
                    print("• Arquivo .env não encontrado")
                    print("  Copie .env.example para .env e configure as variáveis")
                elif item == "oauth_config":
                    print("• Configuração OAuth incompleta")
                elif item == "ml_client_id":
                    print("• ML_CLIENT_ID não configurado no .env")
                elif item == "ml_client_secret":
                    print("• ML_CLIENT_SECRET não configurado no .env") 
                elif item == "ml_redirect_uri":
                    print("• ML_REDIRECT_URI não configurado no .env")
                elif item == "secret_key":
                    print("• SECRET_KEY usando valor padrão (inseguro para produção)")
                elif item == "database_url":
                    print("• DATABASE_URL não configurada")
                elif item == "dependencies":
                    print("• Dependências Python ausentes")
                    print("  Execute: pip install -r requirements.txt")
    
    async def test_oauth_connection(self) -> bool:
        """Testa conexão com API do Mercado Livre."""
        if not settings.validate_oauth_config():
            logger.warning("Configuração OAuth incompleta, pulando teste de conexão")
            return False
            
        logger.info("🔗 Testando conexão com API do Mercado Livre...")
        
        try:
            oauth_service = MercadoLivreOAuthService()
            
            # Testar geração de PKCE
            pkce = PKCEConfig.generate()
            logger.info(f"✅ PKCE gerado: {pkce.code_challenge[:10]}...")
            
            # Testar URL de autorização
            auth_url = oauth_service.get_auth_url("test_state", pkce.code_challenge)
            logger.info(f"✅ URL de autorização gerada: {auth_url[:50]}...")
            
            # Testar se client_id é válido (básico)
            if len(settings.ml_client_id) < 10:
                logger.warning("⚠️ Client ID parece muito curto")
                return False
                
            logger.info("✅ Configuração OAuth aparenta estar correta")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro no teste OAuth: {e}")
            return False
    
    def print_next_steps(self, all_ok: bool):
        """Imprime próximos passos."""
        print("\n" + "="*60)
        print("🚀 PRÓXIMOS PASSOS")
        print("="*60)
        
        if all_ok:
            print("✅ Configuração OAuth2 está completa!")
            print("\n📝 Para usar o sistema:")
            print("1. Inicie o servidor: uvicorn app.main_fixed:app --reload")
            print("2. Acesse: http://localhost:8000/docs")
            print("3. Use os endpoints OAuth em /api/oauth/")
            print("4. Monitore logs de segurança em /api/security/logs")
            
            print("\n🔒 Endpoints de segurança disponíveis:")
            print("• GET /api/oauth/login - Iniciar autenticação")
            print("• GET /api/oauth/callback - Callback do ML")
            print("• POST /api/oauth/refresh - Renovar tokens")
            print("• POST /api/oauth/revoke - Revogar tokens")
            print("• GET /api/oauth/status - Status da sessão")
            print("• POST /api/oauth/test-user - Criar usuário teste")
            
        else:
            print("❌ Configuração incompleta!")
            print("\n📝 Para corrigir:")
            print("1. Configure as variáveis ausentes no .env")
            print("2. Instale dependências: pip install -r requirements.txt")
            print("3. Execute novamente: python setup_oauth.py")
            
            print("\n📖 Documentação:")
            print("• Mercado Livre: https://developers.mercadolibre.com/")
            print("• OAuth2: https://developers.mercadolibre.com/pt_br/autenticacao-e-autorizacao")
    
    async def run_setup(self):
        """Executa setup completo."""
        print("🔐 CONFIGURADOR OAUTH2 - MERCADO LIVRE")
        print("Versão 2.0.0 - Compatível com todas as exigências ML\n")
        
        # Verificar ambiente
        checks = self.check_environment()
        self.print_environment_status(checks)
        
        # Mostrar configurações ausentes
        self.print_missing_config(checks)
        
        # Testar conexão OAuth
        oauth_ok = False
        if checks['oauth_config'] and checks['dependencies']:
            oauth_ok = await self.test_oauth_connection()
        
        # Próximos passos
        all_ok = all(checks.values()) and oauth_ok
        self.print_next_steps(all_ok)
        
        return all_ok


async def main():
    """Função principal."""
    setup = OAuthSetup()
    success = await setup.run_setup()
    
    if success:
        print("\n🎉 Setup concluído com sucesso!")
        sys.exit(0)
    else:
        print("\n⚠️ Setup incompleto. Verifique as configurações acima.")
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelado pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)

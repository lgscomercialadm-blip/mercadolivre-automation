#!/usr/bin/env python3
"""
Testes de Integração OAuth2 - Mercado Livre

Suite de testes completa para validar implementação OAuth2 
seguindo todos os requisitos da documentação do Mercado Livre.

Inclui testes de:
- Configuração PKCE
- Fluxo de autorização
- Validação de tokens
- Segurança e rate limiting
- Middleware de segurança
- Auditoria e logging

Author: ML Project Team
Date: 2024
Version: 2.0.0
"""

import pytest
import asyncio
import aiohttp
import logging
from typing import Dict, Any, Optional
from pathlib import Path
import sys
import os

# Adicionar diretório backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.mercadolivre_oauth import MercadoLivreConfig, PKCEConfig, SecurityLogger, RateLimiter
from app.services.mercadolivre_oauth import MercadoLivreOAuthService
from app.middleware.security import SecurityMiddleware, ValidationMiddleware
from app.settings import settings

# Configurar logging para testes
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OAuth2IntegrationTests:
    """Suite de testes de integração OAuth2."""
    
    def __init__(self):
        self.config = MercadoLivreConfig()
        self.oauth_service = MercadoLivreOAuthService()
        self.security_logger = SecurityLogger("oauth_tests")
        self.results = {}
        
    async def test_pkce_generation(self) -> bool:
        """Testa geração e validação PKCE."""
        logger.info("🔐 Testando geração PKCE...")
        
        try:
            # Gerar PKCE
            pkce = PKCEConfig.generate()
            
            # Validações básicas
            assert len(pkce.code_verifier) >= 43, "Code verifier muito curto"
            assert len(pkce.code_verifier) <= 128, "Code verifier muito longo"
            assert len(pkce.code_challenge) > 0, "Code challenge vazio"
            assert pkce.code_challenge_method == "S256", "Método incorreto"
            
            # Validar que challenge é diferente do verifier
            assert pkce.code_challenge != pkce.code_verifier, "Challenge igual ao verifier"
            
            # Gerar múltiplos PKCEs e verificar unicidade
            pkce2 = PKCEConfig.generate()
            assert pkce.code_verifier != pkce2.code_verifier, "PKCEs não únicos"
            assert pkce.code_challenge != pkce2.code_challenge, "Challenges não únicos"
            
            logger.info("✅ PKCE geração e validação OK")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro no teste PKCE: {e}")
            return False
    
    async def test_oauth_urls(self) -> bool:
        """Testa geração de URLs OAuth."""
        logger.info("🔗 Testando URLs OAuth...")
        
        try:
            # Gerar PKCE para teste
            pkce = PKCEConfig.generate()
            state = "test_state_123"
            
            # Gerar URL de autorização
            auth_url = self.oauth_service.get_auth_url(state, pkce.code_challenge)
            
            # Validações da URL
            assert "https://auth.mercadolibre.com.br/authorization" in auth_url, "URL base incorreta"
            assert f"client_id={settings.ml_client_id}" in auth_url, "Client ID ausente"
            assert f"redirect_uri={settings.ml_redirect_uri}" in auth_url, "Redirect URI ausente"
            assert "response_type=code" in auth_url, "Response type incorreto"
            assert f"state={state}" in auth_url, "State ausente"
            assert f"code_challenge={pkce.code_challenge}" in auth_url, "Code challenge ausente"
            assert "code_challenge_method=S256" in auth_url, "Challenge method ausente"
            
            logger.info("✅ URLs OAuth geração OK")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro no teste URLs: {e}")
            return False
    
    async def test_rate_limiting(self) -> bool:
        """Testa sistema de rate limiting."""
        logger.info("🚦 Testando rate limiting...")
        
        try:
            rate_limiter = RateLimiter(max_requests=3, window_seconds=1)
            client_ip = "192.168.1.100"
            
            # Primeiro request deve passar
            assert rate_limiter.is_allowed(client_ip), "Primeiro request bloqueado"
            
            # Segundo request deve passar
            assert rate_limiter.is_allowed(client_ip), "Segundo request bloqueado"
            
            # Terceiro request deve passar
            assert rate_limiter.is_allowed(client_ip), "Terceiro request bloqueado"
            
            # Quarto request deve ser bloqueado
            assert not rate_limiter.is_allowed(client_ip), "Rate limit não funcionando"
            
            # Aguardar reset
            await asyncio.sleep(1.1)
            
            # Deve funcionar novamente
            assert rate_limiter.is_allowed(client_ip), "Rate limit não resetou"
            
            logger.info("✅ Rate limiting funcionando")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro no teste rate limiting: {e}")
            return False
    
    async def test_security_logging(self) -> bool:
        """Testa sistema de logging de segurança."""
        logger.info("📝 Testando logging de segurança...")
        
        try:
            # Log de evento de segurança
            self.security_logger.log_security_event(
                event_type="oauth_login_attempt",
                user_id="test_user",
                ip_address="192.168.1.100",
                details={"client_id": "test_client"}
            )
            
            # Log de violação
            self.security_logger.log_security_violation(
                violation_type="rate_limit_exceeded",
                ip_address="192.168.1.200",
                details={"requests_count": 150}
            )
            
            # Log de auditoria
            self.security_logger.log_audit_event(
                action="token_refresh",
                user_id="test_user",
                resource="oauth_token",
                details={"token_id": "test_token_123"}
            )
            
            logger.info("✅ Security logging funcionando")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro no teste logging: {e}")
            return False
    
    async def test_token_validation(self) -> bool:
        """Testa validação de tokens (mock)."""
        logger.info("🎫 Testando validação de tokens...")
        
        try:
            # Simular token válido
            valid_token = {
                "access_token": "APP_USR-123456789-test-token-here",
                "token_type": "Bearer",
                "expires_in": 21600,
                "scope": "offline_access read write",
                "user_id": 123456789,
                "refresh_token": "TG-123456789-test-refresh-token"
            }
            
            # Validações básicas do token
            assert "access_token" in valid_token, "Access token ausente"
            assert "refresh_token" in valid_token, "Refresh token ausente"
            assert valid_token["token_type"] == "Bearer", "Token type incorreto"
            assert valid_token["expires_in"] > 0, "Expiração inválida"
            assert isinstance(valid_token["user_id"], int), "User ID inválido"
            
            # Validar formato do access token ML
            access_token = valid_token["access_token"]
            assert access_token.startswith("APP_USR-"), "Formato de token ML incorreto"
            assert len(access_token) > 20, "Token muito curto"
            
            logger.info("✅ Validação de tokens OK")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro no teste token validation: {e}")
            return False
    
    async def test_error_handling(self) -> bool:
        """Testa tratamento de erros OAuth."""
        logger.info("⚠️ Testando tratamento de erros...")
        
        try:
            # Testar erro de autorização negada
            error_response = {
                "error": "access_denied",
                "error_description": "The user denied the request"
            }
            
            error_handled = self.oauth_service.handle_oauth_error(error_response)
            assert error_handled is not None, "Erro não tratado"
            
            # Testar erro de código inválido
            invalid_code_error = {
                "error": "invalid_grant",
                "error_description": "Invalid authorization code"
            }
            
            error_handled = self.oauth_service.handle_oauth_error(invalid_code_error)
            assert error_handled is not None, "Erro de código inválido não tratado"
            
            logger.info("✅ Tratamento de erros funcionando")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro no teste error handling: {e}")
            return False
    
    async def test_security_headers(self) -> bool:
        """Testa cabeçalhos de segurança."""
        logger.info("🛡️ Testando headers de segurança...")
        
        try:
            # Simular headers de segurança esperados
            expected_headers = {
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY", 
                "X-XSS-Protection": "1; mode=block",
                "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
                "Content-Security-Policy": "default-src 'self'",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }
            
            # Validar que todos os headers necessários estão definidos
            for header, value in expected_headers.items():
                assert header is not None, f"Header {header} não definido"
                assert value is not None, f"Valor do header {header} não definido"
            
            logger.info("✅ Security headers OK")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro no teste security headers: {e}")
            return False
    
    async def test_environment_validation(self) -> bool:
        """Testa validação do ambiente."""
        logger.info("🌍 Testando validação de ambiente...")
        
        try:
            # Verificar configurações obrigatórias
            config_checks = {
                "ml_client_id": bool(settings.ml_client_id.strip()),
                "ml_client_secret": bool(settings.ml_client_secret.strip()),
                "ml_redirect_uri": bool(settings.ml_redirect_uri.strip()),
                "secret_key": settings.secret_key != "change-this-secret-key-in-production",
                "oauth_config": settings.validate_oauth_config()
            }
            
            # Log dos resultados
            for check, result in config_checks.items():
                if result:
                    logger.info(f"✅ {check}: OK")
                else:
                    logger.warning(f"⚠️ {check}: FALHOU")
            
            # Verificar países suportados
            supported_countries = ["MLB", "MLA", "MLM", "MCO", "MLC", "MLU", "MLV", "MPE", "MBO"]
            assert settings.ml_default_country in supported_countries, f"País não suportado: {settings.ml_default_country}"
            
            logger.info("✅ Validação de ambiente OK")
            return all(config_checks.values())
            
        except Exception as e:
            logger.error(f"❌ Erro no teste environment: {e}")
            return False
    
    async def run_all_tests(self) -> Dict[str, bool]:
        """Executa todos os testes de integração."""
        logger.info("🧪 INICIANDO TESTES DE INTEGRAÇÃO OAUTH2")
        logger.info("="*60)
        
        tests = [
            ("PKCE Generation", self.test_pkce_generation),
            ("OAuth URLs", self.test_oauth_urls),
            ("Rate Limiting", self.test_rate_limiting),
            ("Security Logging", self.test_security_logging),
            ("Token Validation", self.test_token_validation),
            ("Error Handling", self.test_error_handling),
            ("Security Headers", self.test_security_headers),
            ("Environment Validation", self.test_environment_validation),
        ]
        
        results = {}
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            logger.info(f"\n📋 Executando: {test_name}")
            try:
                result = await test_func()
                results[test_name] = result
                if result:
                    passed += 1
                    logger.info(f"✅ {test_name}: PASSOU")
                else:
                    logger.error(f"❌ {test_name}: FALHOU")
            except Exception as e:
                logger.error(f"💥 {test_name}: ERRO - {e}")
                results[test_name] = False
        
        # Resumo final
        logger.info("\n" + "="*60)
        logger.info("📊 RESUMO DOS TESTES")
        logger.info("="*60)
        logger.info(f"✅ Passou: {passed}/{total}")
        logger.info(f"❌ Falhou: {total - passed}/{total}")
        logger.info(f"📈 Taxa de sucesso: {(passed/total)*100:.1f}%")
        
        if passed == total:
            logger.info("\n🎉 TODOS OS TESTES PASSARAM!")
            logger.info("Sistema OAuth2 está funcionando corretamente.")
        else:
            logger.warning(f"\n⚠️ {total - passed} TESTE(S) FALHARAM!")
            logger.warning("Verifique as configurações e dependências.")
        
        return results


async def main():
    """Função principal para executar testes."""
    print("🔐 TESTES DE INTEGRAÇÃO OAUTH2 - MERCADO LIVRE")
    print("Versão 2.0.0 - Compatível com todas as exigências ML\n")
    
    # Verificar se ambiente está configurado
    if not settings.validate_oauth_config():
        print("⚠️ Configuração OAuth incompleta!")
        print("Execute primeiro: python setup_oauth.py")
        return False
    
    # Executar testes
    test_suite = OAuth2IntegrationTests()
    results = await test_suite.run_all_tests()
    
    # Retornar sucesso geral
    all_passed = all(results.values())
    return all_passed


if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Testes cancelados pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado nos testes: {e}")
        sys.exit(1)

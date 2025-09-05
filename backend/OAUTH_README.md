# OAuth2 Mercado Livre - Implementação Completa

[![OAuth2](https://img.shields.io/badge/OAuth2-PKCE-green.svg)](https://tools.ietf.org/html/rfc7636)
[![Security](https://img.shields.io/badge/Security-Enterprise-blue.svg)](https://developers.mercadolibre.com/)
[![ML Compliance](https://img.shields.io/badge/ML-Compliant-orange.svg)](https://developers.mercadolibre.com/pt_br/autenticacao-e-autorizacao)

## 📋 Visão Geral

Implementação **completa** e **production-ready** do sistema OAuth2 para integração com Mercado Livre, seguindo **TODOS** os requisitos da documentação oficial, incluindo:

- ✅ **OAuth2 com PKCE** (Proof Key for Code Exchange)
- ✅ **Rate Limiting** e proteção contra ataques
- ✅ **Security Middleware** com múltiplas camadas
- ✅ **Audit Logging** e monitoramento de segurança
- ✅ **Validação completa** de tokens e sessões
- ✅ **Headers de segurança** obrigatórios
- ✅ **Tratamento de erros** robusto
- ✅ **Testes de integração** automatizados

## 🏗️ Arquitetura

```
backend/
├── app/
│   ├── core/
│   │   └── mercadolivre_oauth.py      # Configuração OAuth2 + PKCE
│   ├── services/
│   │   └── mercadolivre_oauth.py      # Serviço OAuth2
│   ├── routers/
│   │   └── oauth_secure.py           # Endpoints OAuth seguros
│   ├── middleware/
│   │   └── security.py               # Middleware de segurança
│   ├── main_fixed.py                 # App principal v2.0.0
│   └── settings.py                   # Configurações completas
├── setup_oauth.py                    # Setup automático
├── test_oauth_integration.py         # Testes de integração
├── .env.example                      # Template de configuração
└── requirements.txt                  # Dependências atualizadas
```

## 🚀 Quick Start

### 1. Configuração Inicial

```bash
# 1. Clonar e navegar para o backend
cd backend

# 2. Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do ML
```

### 2. Configuração do Mercado Livre

```bash
# Executar setup automático
python setup_oauth.py
```

**Variáveis obrigatórias no .env:**

```env
# Mercado Livre OAuth2 - OBRIGATÓRIO
ML_CLIENT_ID=seu_client_id_aqui
ML_CLIENT_SECRET=seu_client_secret_aqui
ML_REDIRECT_URI=http://localhost:8000/api/oauth/callback
ML_DEFAULT_COUNTRY=MLB

# Security - Alterar em produção
SECRET_KEY=sua_chave_secreta_super_segura_aqui
```

### 3. Iniciar Aplicação

```bash
# Modo desenvolvimento
uvicorn app.main_fixed:app --reload

# Modo produção
uvicorn app.main_fixed:app --host 0.0.0.0 --port 8000
```

### 4. Executar Testes

```bash
# Testes de integração OAuth2
python test_oauth_integration.py

# Testes unitários
pytest tests/ -v
```

## 🔐 Endpoints OAuth2

### Documentação Interativa
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/oauth/login` | Iniciar autenticação OAuth |
| `GET` | `/api/oauth/callback` | Callback do Mercado Livre |
| `POST` | `/api/oauth/refresh` | Renovar access token |
| `POST` | `/api/oauth/revoke` | Revogar tokens |
| `GET` | `/api/oauth/status` | Status da sessão |
| `POST` | `/api/oauth/test-user` | Criar usuário de teste |

### Exemplo de Uso

```python
import httpx

# 1. Iniciar autenticação
response = httpx.get("http://localhost:8000/api/oauth/login")
auth_url = response.json()["auth_url"]

# 2. Usuário autoriza no ML e retorna com código
# 3. Sistema processa callback automaticamente

# 4. Verificar status
response = httpx.get("http://localhost:8000/api/oauth/status")
print(response.json())
```

## 🛡️ Recursos de Segurança

### Rate Limiting
- **OAuth endpoints**: 5 requests/minuto por IP
- **API geral**: 100 requests/minuto por IP
- **Bloqueio automático** de IPs suspeitos

### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### Audit Logging
- **Security events**: Login, logout, token refresh
- **Violations**: Rate limit exceeded, invalid tokens
- **Audit trail**: Todas as ações críticas

### PKCE Implementation
```python
# Geração automática de PKCE
pkce = PKCEConfig.generate()
# code_verifier: 43-128 caracteres aleatórios
# code_challenge: SHA256(code_verifier) em base64url
# code_challenge_method: S256
```

## 📊 Monitoramento

### Logs de Segurança
```python
# Visualizar logs
GET /api/security/logs

# Métricas de segurança
GET /api/security/metrics
```

### Health Checks
```python
# Status da aplicação
GET /health

# Status OAuth específico
GET /api/oauth/health
```

## 🧪 Testes

### Testes Automáticos Inclusos
- ✅ Geração e validação PKCE
- ✅ URLs OAuth2 válidas
- ✅ Rate limiting funcionando
- ✅ Security logging
- ✅ Validação de tokens
- ✅ Tratamento de erros
- ✅ Headers de segurança
- ✅ Validação de ambiente

### Executar Testes
```bash
# Suite completa
python test_oauth_integration.py

# Testes específicos
pytest tests/test_oauth.py -v
pytest tests/test_security.py -v
```

## 🏭 Deploy em Produção

### Variáveis de Produção
```env
ENV=production
DEBUG=false
FORCE_HTTPS=true
SECRET_KEY=chave_super_segura_produção
ML_CLIENT_ID=seu_client_id_produção
ML_CLIENT_SECRET=seu_secret_produção
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://redis-host:6379/0
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - ENV=production
      - ML_CLIENT_ID=${ML_CLIENT_ID}
      - ML_CLIENT_SECRET=${ML_CLIENT_SECRET}
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
```

### SSL/TLS
```bash
# Certificados SSL
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
FORCE_HTTPS=true
```

## 📝 Compliance Checklist

### ✅ Requisitos do Mercado Livre
- [x] OAuth2 com PKCE obrigatório
- [x] Validação de redirect_uri
- [x] Tratamento de erros padronizado
- [x] Rate limiting implementado
- [x] Headers de segurança obrigatórios
- [x] Logging de auditoria
- [x] Validação de tokens
- [x] Suporte a refresh tokens
- [x] Revogação de tokens
- [x] Modo teste implementado

### ✅ Segurança Empresarial
- [x] Middleware de segurança em camadas
- [x] Validação de input/output
- [x] Proteção contra XSS/CSRF
- [x] IP whitelisting configurável
- [x] Content Security Policy
- [x] Secure cookies
- [x] HTTPS enforcement
- [x] Session management seguro

## 🔧 Troubleshooting

### Problemas Comuns

**1. Setup OAuth Falha**
```bash
# Verificar configuração
python setup_oauth.py

# Logs detalhados
tail -f logs/security.log
```

**2. Rate Limit Atingido**
```python
# Verificar status
GET /api/security/rate-limit-status

# Reset manual (desenvolvimento)
POST /api/security/reset-rate-limits
```

**3. Token Inválido**
```python
# Renovar token
POST /api/oauth/refresh
Content-Type: application/json
{
  "refresh_token": "seu_refresh_token"
}
```

### Logs Importantes
```bash
# Logs de segurança
tail -f logs/security.log

# Logs OAuth
tail -f logs/oauth.log

# Logs da aplicação
tail -f logs/app.log
```

## 📞 Suporte

### Documentação Oficial
- [Mercado Livre Developers](https://developers.mercadolibre.com/)
- [OAuth2 Guide](https://developers.mercadolibre.com/pt_br/autenticacao-e-autorizacao)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)

### Issues e Contribuições
- Reporte bugs via Issues do GitHub
- Siga as convenções de código (Black, isort)
- Todos os PRs precisam passar nos testes

## 📄 Licença

Este projeto segue as práticas de segurança e compliance do Mercado Livre.
Implementação enterprise-grade para uso em produção.

---

**🔐 Implementação OAuth2 Completa - Pronta para Produção**

*Versão 2.0.0 - Compatível com todas as exigências do Mercado Livre*

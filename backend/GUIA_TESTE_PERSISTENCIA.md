# 🎯 GUIA PARA TESTAR O SISTEMA DE PERSISTÊNCIA

## ✅ O QUE JÁ FOI IMPLEMENTADO

✅ **Sistema de banco de dados SQLite** (`ml_project.db`)
✅ **Modelo MLUserToken** para armazenar tokens permanentemente  
✅ **Serviço MLUserTokenService** para gerenciar tokens
✅ **Integração OAuth2** com persistência automática
✅ **Endpoints de debug** para verificar tokens

## 🚀 COMO TESTAR O SISTEMA

### 1. **INICIAR O SERVIDOR**

Opção A - Arquivo batch (recomendado):
```bash
start_server.bat
```

Opção B - Comando direto:
```bash
python main.py
```

Opção C - Com uvicorn:
```bash
python -m uvicorn main:app --reload --port 8002
```

### 2. **VERIFICAR SE SERVIDOR ESTÁ FUNCIONANDO**

Acesse no navegador:
- http://localhost:8002/ (deve mostrar informações da API)
- http://localhost:8002/health (health check)

Ou teste no terminal:
```bash
python -c "import requests; print('Status:', requests.get('http://localhost:8002/').status_code)"
```

### 3. **AUTORIZAR UM USUÁRIO NO MERCADO LIVRE**

🔗 **Acesse o link de autorização:**
https://82168383a3bf.ngrok-free.app/api/user-auth/

**Fluxo:**
1. Clique em "Autorizar no Mercado Livre"
2. Faça login na sua conta ML
3. Autorize a aplicação CortexIA
4. Será redirecionado com sucesso
5. Token será **salvo automaticamente no banco**

### 4. **VERIFICAR SE TOKEN FOI PERSISTIDO**

Execute o teste final:
```bash
python teste_final_sistema.py
```

Ou verifique via API:
```bash
curl http://localhost:8002/api/user-auth/status
```

### 5. **TESTAR PERSISTÊNCIA (PROVA REAL)**

1. **Autorize um usuário** (passo 3)
2. **Pare o servidor** (Ctrl+C)
3. **Reinicie o servidor** (passo 1)
4. **Execute o teste** (passo 4)
5. **Resultado esperado**: Token continua funcionando! 🎉

## 🔍 VERIFICAÇÕES IMPORTANTES

### ✅ Banco de Dados
```bash
# Verificar se banco existe
ls -la ml_project.db

# Contar tokens salvos
python -c "import sqlite3; conn=sqlite3.connect('ml_project.db'); print('Tokens:', conn.execute('SELECT COUNT(*) FROM ml_user_tokens WHERE is_active=1').fetchone()[0])"
```

### ✅ Servidor Funcionando
```bash
curl http://localhost:8002/api/user-auth/status
```

### ✅ Token Específico
```bash
curl "http://localhost:8002/api/debug/user-token-full/SEU_USER_ID?secret=debug123"
```

## 🎯 CENÁRIOS DE TESTE

### Cenário 1: Primeira Autorização
1. Banco vazio
2. Autorizar usuário
3. Verificar se token foi salvo
4. ✅ **Resultado**: Token no banco, APIs funcionando

### Cenário 2: Persistência após Reinício
1. Usuario já autorizado
2. Parar servidor
3. Reiniciar servidor  
4. Testar APIs
5. ✅ **Resultado**: Token recuperado do banco, APIs funcionando

### Cenário 3: Múltiplos Usuários
1. Autorizar usuário A
2. Autorizar usuário B
3. Verificar ambos no banco
4. ✅ **Resultado**: Ambos persistidos independentemente

## 🐛 TROUBLESHOOTING

### Problema: Servidor não inicia
```bash
# Verificar dependências
pip install -r requirements.txt

# Testar imports
python -c "from app.routers.user_authorization import router; print('OK')"
```

### Problema: Token não persiste
```bash
# Verificar permissões do banco
ls -la ml_project.db

# Verificar logs do servidor
```

### Problema: API retorna 401
```bash
# Verificar se token existe no banco
python teste_final_sistema.py

# Re-autorizar se necessário
```

## 🎉 RESULTADO ESPERADO

Após completar os testes, você deve ter:

✅ **Servidor rodando** na porta 8002  
✅ **Usuário autorizado** com token salvo no banco  
✅ **APIs do ML funcionando** usando token persistido  
✅ **Persistência confirmada** após reiniciar servidor  
✅ **Sistema totalmente operacional** para automações  

---

## 📱 LINKS IMPORTANTES

- **Autorização**: https://82168383a3bf.ngrok-free.app/api/user-auth/
- **Status**: http://localhost:8002/api/user-auth/status  
- **Debug**: http://localhost:8002/api/debug/
- **Health**: http://localhost:8002/health

---

🎯 **MISSÃO**: Testar se o token persiste após reiniciar o servidor!
🔥 **META**: Nunca mais perder tokens de autorização!
✨ **RESULTADO**: Sistema 100% confiável para automações ML!

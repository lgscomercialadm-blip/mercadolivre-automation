# 📋 DADOS IMPORTANTES DO PROJETO

## 🌐 **URLS DO VERCEL:**

### **URL Principal (Atual):**
```
https://diagnostics-app-topaz.vercel.app
```

### **URLs de Teste (Históricas):**
```
https://diagnostics-app-fixed.vercel.app
```

---

## 🔑 **VARIÁVEIS DE AMBIENTE NECESSÁRIAS:**

### **No Vercel (Settings → Environment Variables):**
```
MELI_CLIENT_ID=seu_client_id_do_mercadolivre
MELI_CLIENT_SECRET=seu_client_secret_do_mercadolivre  
MELI_REDIRECT_URI=https://diagnostics-app-topaz.vercel.app/api/oauth/callback
```

---

## 🎯 **ENDPOINTS PRINCIPAIS:**

### **OAuth:**
- **Login:** `https://diagnostics-app-topaz.vercel.app/api/oauth/login`
- **Callback:** `https://diagnostics-app-topaz.vercel.app/api/oauth/callback`
- **Status:** `https://diagnostics-app-topaz.vercel.app/api/oauth/status` ← **NOVO!**
- **Refresh:** `https://diagnostics-app-topaz.vercel.app/api/oauth/refresh`
- **Session:** `https://diagnostics-app-topaz.vercel.app/api/session`

### **Mercado Livre:**
- **Vendas:** `https://diagnostics-app-topaz.vercel.app/api/meli/sales?days=30`
- **Anúncios:** `https://diagnostics-app-topaz.vercel.app/api/meli/ads`
- **Conta:** `https://diagnostics-app-topaz.vercel.app/api/meli/account-info`
- **Notificações:** `https://diagnostics-app-topaz.vercel.app/api/meli/notifications`

### **Frontend:**
- **Dashboard:** `https://diagnostics-app-topaz.vercel.app/dashboard`
- **Diagnóstico:** `https://diagnostics-app-topaz.vercel.app/diagnostics`
- **Test Users:** `https://diagnostics-app-topaz.vercel.app/test-users`

---

## 🚀 **COMANDOS DE DEPLOY:**

### **Vercel CLI (se instalado):**
```bash
cd diagnostics-app
vercel --prod
```

### **Git Push (Auto-deploy):**
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

---

## 📊 **STATUS ATUAL:**

### **✅ Implementado:**
- Sistema de diagnóstico OAuth completo
- Dashboard visual de status
- Endpoints de vendas, anúncios, conta
- Correções de linting (build passando)
- Documentação completa

### **⚠️ A Testar:**
- Login OAuth funcionando
- Endpoints protegidos
- Sistema de diagnóstico

### **❌ Pendente:**
- Refresh token automático
- Validação de token com ML
- Rate limiting
- Cache de resultados

---

## 🔧 **CONFIGURAÇÃO NO MERCADO LIVRE:**

### **App no Dev Center:**
1. Acesse: https://developers.mercadolivre.com.br/devcenter
2. Edite sua aplicação
3. **Redirect URI:** `https://diagnostics-app-topaz.vercel.app/api/oauth/callback`
4. **Scopes:** `offline_access read write`

---

## 📝 **PRÓXIMOS PASSOS:**

### **1. Testar Diagnóstico:**
```
https://diagnostics-app-topaz.vercel.app
```
- Verificar status das variáveis
- Testar login OAuth
- Validar endpoints

### **2. Implementar Refresh Token:**
- Middleware de auto-refresh
- Helper getValidToken()
- Atualizar endpoints

### **3. Melhorias:**
- Paginação de vendas
- Cache de resultados
- Rate limiting

---

**Última atualização:** $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Commit:** 2c3e0112
**Status:** ✅ Pronto para teste

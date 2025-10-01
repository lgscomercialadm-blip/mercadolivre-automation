# 🔍 GUIA DE TESTE - OAUTH DIAGNÓSTICO

## 🎯 PASSOS PARA DIAGNOSTICAR O PROBLEMA

### **1. VERIFICAR STATUS DO SISTEMA** ✅

Acesse a página inicial que agora mostra o status completo:

```
https://diagnostics-app-topaz.vercel.app
```

**O que você vai ver:**
- ✅/❌ Status das variáveis de ambiente
- ✅/❌ Status dos cookies
- ✅/❌ Status da sessão
- URL de redirect configurada

---

### **2. VERIFICAR STATUS VIA API** 🔍

Acesse diretamente o endpoint de status:

```
https://diagnostics-app-topaz.vercel.app/api/oauth/status
```

**Resposta esperada:**
```json
{
  "environment": {
    "hasClientId": true,
    "hasClientSecret": true,
    "hasRedirectUri": true,
    "redirectUri": "https://diagnostics-app-topaz.vercel.app/api/oauth/callback"
  },
  "cookies": {
    "hasTokenCookie": false,
    "hasStateCookie": false,
    "hasVerifierCookie": false
  },
  "session": {
    "isAuthenticated": false,
    "hasAccessToken": false,
    "hasRefreshToken": false
  }
}
```

---

### **3. POSSÍVEIS PROBLEMAS E SOLUÇÕES** 🔧

#### **Problema 1: Variáveis de ambiente não configuradas** ❌

Se você vir:
```json
{
  "hasClientId": false,
  "hasClientSecret": false,
  "hasRedirectUri": false
}
```

**Solução:**
1. Acesse: https://vercel.com/lgscomercialadm-blips-projects/diagnostics-app-topaz/settings/environment-variables
2. Adicione:
   - `MELI_CLIENT_ID` = seu app ID do Mercado Livre
   - `MELI_CLIENT_SECRET` = seu secret do Mercado Livre
   - `MELI_REDIRECT_URI` = `https://diagnostics-app-topaz.vercel.app/api/oauth/callback`
3. Faça redeploy: `vercel --prod` ou via dashboard Vercel

---

#### **Problema 2: Redirect URI incorreta** ⚠️

Se a URL de redirect não bater com a configurada no app do Mercado Livre:

**Verificar em:**
1. https://developers.mercadolivre.com.br/devcenter (suas aplicações)
2. Editar aplicação
3. Verificar "Redirect URI" configurada
4. Deve ser: `https://diagnostics-app-topaz.vercel.app/api/oauth/callback`

---

#### **Problema 3: Login falha mas variáveis estão OK** 🔄

Se as variáveis estão configuradas mas o login ainda falha:

**Teste passo a passo:**

1. **Limpar cookies:**
   - Abra DevTools (F12)
   - Application → Cookies
   - Limpe todos os cookies do site

2. **Teste o login:**
   ```
   https://diagnostics-app-topaz.vercel.app/api/oauth/login
   ```

3. **Você será redirecionado para o Mercado Livre**
   - Faça login na sua conta
   - Autorize a aplicação

4. **Após autorizar, será redirecionado de volta**
   - URL esperada: `https://diagnostics-app-topaz.vercel.app/api/oauth/callback?code=...&state=...`

5. **Verificar resposta do callback:**
   - Deve mostrar: `{"ok": true, "user_id": 123456, "scope": "..."}`
   - Se mostrar erro: anote a mensagem!

---

#### **Problema 4: Callback retorna erro** ❌

Se ao voltar do ML você vir:
```json
{
  "ok": false,
  "step": "verifier",
  "error": "code_verifier não encontrado"
}
```

**Possíveis causas:**
1. Cookies estão bloqueados (navegador em modo privado)
2. SameSite cookie policy
3. State expirou (>15 minutos)

**Solução:**
- Use navegador normal (não privado)
- Tente novamente (não demore >15min)
- Verifique se cookies estão habilitados

---

#### **Problema 5: Token não persiste** 🔄

Se você consegue fazer login mas ao recarregar a página perde a sessão:

**Verificar:**
1. Cookie `meli_token` está sendo setado
2. Cookie tem `maxAge: 30 dias`
3. Cookie não está sendo deletado

**Teste:**
```
https://diagnostics-app-topaz.vercel.app/api/session
```

Deve retornar:
```json
{
  "token": {
    "access_token": "APP_USR-...",
    "user_id": 123456,
    ...
  }
}
```

---

### **4. TESTE COMPLETO DO FLUXO** 🎯

Se tudo estiver configurado, faça o teste completo:

#### **Passo 1: Verificar status**
```
https://diagnostics-app-topaz.vercel.app/api/oauth/status
```

#### **Passo 2: Fazer login**
```
https://diagnostics-app-topaz.vercel.app/api/oauth/login
```

#### **Passo 3: Verificar sessão**
```
https://diagnostics-app-topaz.vercel.app/api/session
```

#### **Passo 4: Testar endpoint protegido**
```
https://diagnostics-app-topaz.vercel.app/api/meli/account-info
```

---

### **5. LOGS E DEBUG** 🔍

Se nada funcionar, verifique os logs no Vercel:

1. Acesse: https://vercel.com/lgscomercialadm-blips-projects/diagnostics-app-topaz
2. Clique em "Deployments"
3. Clique no deployment mais recente
4. Clique em "Runtime Logs"
5. Procure por erros durante o callback

---

## 📝 CHECKLIST RÁPIDO

Antes de testar o login, verifique:

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Redirect URI correta no app do ML
- [ ] Redirect URI correta na variável `MELI_REDIRECT_URI`
- [ ] Navegador com cookies habilitados
- [ ] Não está em modo privado/incógnito
- [ ] App do ML está ativo (não em sandbox se for produção)

---

## 🆘 AINDA NÃO FUNCIONA?

**Me envie:**

1. Screenshot do `/api/oauth/status`
2. Erro que aparece no `/api/oauth/callback`
3. Logs do Vercel (se possível)
4. Qual passo está falhando

---

**Última atualização:** Sistema de diagnóstico OAuth implementado
**Status:** Aguardando teste do usuário


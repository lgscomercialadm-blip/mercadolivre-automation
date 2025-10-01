# ⚠️ VERIFICAÇÃO FINAL - VARIÁVEIS DE AMBIENTE NO VERCEL

## 🎯 Acesse: https://vercel.com/diagnostics-app-topaz/settings/environment-variables

## ✅ EXATAMENTE ESTAS VARIÁVEIS DEVEM ESTAR CONFIGURADAS:

### 1. MELI_CLIENT_ID
**Valor esperado:** `7854621335491058`
**Aplicar para:** Production, Preview, Development

### 2. MELI_CLIENT_SECRET  
**Valor esperado:** `sIAU2uT3lJ8VVpntJA3KU5x5koY5WZgD`
**Aplicar para:** Production, Preview, Development

### 3. MELI_REDIRECT_URI
**Valor esperado:** `https://diagnostics-app-topaz.vercel.app/api/oauth/callback`
**⚠️ IMPORTANTE:** Deve ser `-topaz` e NÃO `-fixed`
**Aplicar para:** Production, Preview, Development

### 4. NEXTAUTH_SECRET
**Valor:** `tBpNVjMYIGwbD18eR8yvUfFIGtVmQdsExCWR9YvnWVU=`
**Aplicar para:** Production, Preview, Development

### 5. NEXTAUTH_URL
**Valor:** `https://diagnostics-app-topaz.vercel.app`
**Aplicar para:** Production

---

## 🔍 DEPOIS DE VERIFICAR:

1. Se alguma variável estiver **ERRADA** ou **AUSENTE**, corrija e clique em **Save**
2. Depois vá em **Deployments** e clique em **Redeploy** no último deployment
3. Aguarde o deploy terminar (uns 2-3 minutos)
4. Teste novamente: https://diagnostics-app-topaz.vercel.app

---

## 🚨 SE AINDA DER ERRO `invalid_client`:

O problema está no **App do Mercado Livre**. Verifique em:
https://developers.mercadolivre.com.br/devcenter (suas aplicações)

**Redirect URI configurado no app ML deve ser:**
`https://diagnostics-app-topaz.vercel.app/api/oauth/callback`

**Client ID no app ML deve ser:**
`7854621335491058`

Se o Client ID for diferente, use o que está no app ML e atualize no Vercel.


# 🧪 GUIA DE TESTE - FASE 1 IMPLEMENTADA

## 🎯 O QUE TESTAR

Agora que implementamos a Fase 1, você precisa testar se tudo está funcionando corretamente!

---

## 📋 CHECKLIST DE TESTES

### **1. Fazer Login no Sistema** ✅

**URL:** https://diagnostics-app-fixed.vercel.app/api/oauth/login

**Passos:**
1. Clique no link acima
2. Faça login com sua conta do Mercado Livre
3. Autorize o app
4. Deve redirecionar com sucesso

---

### **2. Testar Endpoint de Vendas** 🛒

**URL Direta (copie no navegador após login):**
```
https://diagnostics-app-fixed.vercel.app/api/meli/sales?days=30
```

**O que deve aparecer:**
```json
{
  "ok": true,
  "period_days": 30,
  "date_from": "2024-09-01T...",
  "metrics": {
    "total_orders": X,
    "total_revenue": X.XX,
    "avg_order_value": X.XX,
    "status_distribution": {
      "paid": X,
      "delivered": X
    },
    "payment_methods": {
      "account_money": X,
      "credit_card": X
    }
  },
  "top_sellers": [
    {
      "id": "MLB123...",
      "title": "Nome do Produto",
      "quantity": X,
      "revenue": X.XX
    }
  ],
  "zero_sales_products": [...]
}
```

**✅ Verificar:**
- [ ] `total_orders` está correto (conta pedidos, não produtos)
- [ ] `top_sellers` mostra produtos que REALMENTE venderam no período
- [ ] `quantity` nos top_sellers é do PERÍODO (não histórico total)
- [ ] `zero_sales_products` mostra produtos sem vendas

**🔍 Como validar:**
Compare com o painel do Mercado Livre:
1. Acesse: https://www.mercadolivre.com.br/vendas/lista
2. Filtre por últimos 30 dias
3. Conte os pedidos - deve bater com `total_orders`
4. Veja produtos vendidos - deve bater com `top_sellers`

---

### **3. Testar Endpoint de Anúncios** 📦

**URL Direta:**
```
https://diagnostics-app-fixed.vercel.app/api/meli/ads
```

**O que deve aparecer:**
```json
{
  "ok": true,
  "total": X,
  "analyzed": X,
  "avg_quality_score": 75,
  "common_issues": {
    "title_too_short": 5,
    "few_images": 3,
    "no_free_shipping": 10,
    "custom_shipping": 15
  },
  "items": [
    {
      "id": "MLB123...",
      "title": "Título do Produto",
      "quality_score": 85,
      "images_count": 6,
      "attributes_count": 8,
      "shipping_free": true,
      "shipping_mode": "me2",
      "missing_fields": [],
      "improvement_suggestions": [
        "Ideal ter 6-8 imagens mostrando todos os ângulos"
      ]
    }
  ]
}
```

**✅ Verificar:**
- [ ] `total` mostra TODOS os seus anúncios (não só 10)
- [ ] `avg_quality_score` está entre 0-100
- [ ] `common_issues` mostra problemas agregados
- [ ] Cada item tem `quality_score`
- [ ] Cada item tem `improvement_suggestions`

**🔍 Como validar:**
1. Conte seus anúncios no painel do ML
2. Compare com `total` - deve bater
3. Veja um anúncio específico
4. Compare dados (imagens, preço, etc)

---

### **4. Testar Endpoint de Reputação** ⭐

**URL Direta:**
```
https://diagnostics-app-fixed.vercel.app/api/meli/account-info
```

**O que deve aparecer:**
```json
{
  "ok": true,
  "user": {
    "id": X,
    "nickname": "...",
    "seller_reputation": {...}
  },
  "reputation": {
    "level_id": "5_green",
    "transactions": {...},
    "ratings": {...}
  },
  "insights": [
    {
      "type": "excellent_reputation",
      "message": "Reputação excelente!",
      "severity": "success",
      "icon": "🏆"
    }
  ],
  "improvement_suggestions": [
    {
      "type": "level_improvement",
      "suggestion": "Foque em melhorar...",
      "impact": "high",
      "icon": "📈"
    }
  ]
}
```

**✅ Verificar:**
- [ ] `insights` mostra análise da reputação
- [ ] `severity` está correto (success/warning/critical)
- [ ] `improvement_suggestions` tem sugestões relevantes
- [ ] `impact` está classificado (high/medium/low)

**🔍 Como validar:**
1. Acesse sua reputação no ML: https://www.mercadolibre.com.br/perfil/reputacao
2. Compare nível, transações, etc
3. Veja se os insights fazem sentido

---

### **5. Testar Dashboard Visual** 🎨

**URL:**
```
https://diagnostics-app-fixed.vercel.app/diagnostics
```

**O que deve aparecer:**
- [ ] Informações da conta
- [ ] Anúncios analisados
- [ ] Vendas dos últimos 30 dias

**⚠️ NOTA:** O dashboard ainda está básico (mostra JSON). 
Na Fase 3 vamos criar visual bonito com gráficos!

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### **Problema 1: "Não autenticado"**
**Solução:** Faça login novamente:
```
https://diagnostics-app-fixed.vercel.app/api/oauth/login
```

### **Problema 2: Vendas mostrando 0**
**Possíveis causas:**
- Você não tem pedidos nos últimos 30 dias
- Tente: `/api/meli/sales?days=60` (últimos 60 dias)
- Tente: `/api/meli/sales?days=90` (últimos 90 dias)

### **Problema 3: Anúncios não aparecem**
**Possíveis causas:**
- Verifique se tem anúncios ativos
- Erro de autenticação - faça login novamente

### **Problema 4: Erro 500**
**Solução:**
1. Verifique os logs no Vercel
2. Me envie o erro para eu corrigir

---

## 📊 COMPARAÇÃO: Antes vs Depois

### **ANTES (com bugs):**
❌ `sold_quantity` mostrava total histórico (errado)
❌ Só 10 anúncios analisados
❌ Sem insights ou sugestões
❌ Sem score de qualidade

### **DEPOIS (Fase 1):**
✅ Vendas REAIS do período (correto)
✅ TODOS os anúncios analisados
✅ Insights automáticos
✅ Sugestões de melhoria
✅ Score de qualidade 0-100

---

## 🎯 PRÓXIMOS PASSOS APÓS TESTES

### **Se tudo funcionar:**
✅ Fase 1 validada!
➡️ Podemos partir para Fase 2:
   - Campanhas publicitárias
   - Promoções e cupons
   - Perguntas e respostas
   - Reclamações

### **Se encontrar bugs:**
🐛 Me avise que eu corrijo!
Preciso saber:
1. Qual endpoint deu erro
2. Qual foi o erro
3. Print/log se possível

---

## 💡 DICAS DE TESTE

### **Teste com dados reais:**
- Use sua conta real do ML
- Veja se os números batem
- Valide as sugestões

### **Teste casos extremos:**
- Conta nova (poucas vendas)
- Conta antiga (muitas vendas)
- Reputação baixa
- Reputação alta

### **Valide a lógica:**
- Top sellers faz sentido?
- Produtos parados estão corretos?
- Sugestões são relevantes?

---

## 📞 SUPORTE

**Encontrou problema?** Me avise com:
1. URL que testou
2. Erro que apareceu
3. O que esperava ver

**Tudo funcionando?** Me avise e vamos para Fase 2! 🚀

---

**Última atualização:** Fase 1 - Implementação completa
**Status:** ✅ Pronto para teste
**Próximo:** Aguardando validação para Fase 2


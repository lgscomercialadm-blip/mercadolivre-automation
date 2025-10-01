# 🎯 PLANO COMPLETO DE DADOS - DIAGNÓSTICO MERCADO LIVRE
**Especialista em Varejo & Marketplace - Análise para Agências**

---

## 📊 VISÃO GERAL: O QUE PRECISA NA PRIMEIRA TELA (LOGIN)

Quando um seller faz login, você precisa puxar **TUDO** para ter uma visão 360º antes da reunião comercial.

---

## 🔴 PRIORIDADE CRÍTICA (Primeira Tela - Dashboard Executivo)

### **1️⃣ HEALTH SCORE DA CONTA** ⭐⭐⭐⭐⭐
**Por quê:** Mostra se a conta está em risco de bloqueio ou restrições

**Dados necessários:**
- ✅ Status da conta (active, blocked, under_review)
- ✅ Nível de reputação (verde, amarelo, vermelho)
- ✅ Score numérico (0-100)
- ✅ Power Seller Status (sim/não)
- ✅ Mercado Líder (nível: platinum, gold, etc)
- ✅ Taxa de cancelamento (crítico < 2%)
- ✅ Taxa de claims/reclamações (crítico < 1%)
- ✅ Delayed handling time (crítico < 5%)
- ✅ Problemas de envio (crítico < 3%)

**Endpoint:** `GET /users/{user_id}` + `GET /users/{user_id}/reputation`

**Valor para agência:**
- 🚨 Alerta vermelho: conta em risco → venda urgente de melhorias
- ⚠️ Alerta amarelo: conta precisa de atenção → venda de consultoria
- ✅ Verde: conta saudável → venda de crescimento/otimização

---

### **2️⃣ PERFORMANCE ÚLTIMOS 30 vs 60 DIAS** ⭐⭐⭐⭐⭐
**Por quê:** Mostra se o seller está crescendo ou caindo

**Dados necessários:**

**Vendas:**
- ✅ Total de vendas (30 dias)
- ✅ Total de vendas (60 dias) 
- ✅ Crescimento % (30 vs 60 dias)
- ✅ Receita total (30 dias)
- ✅ Receita total (60 dias)
- ✅ Crescimento de receita %
- ✅ Ticket médio (30 dias)
- ✅ Ticket médio (60 dias)
- ✅ Taxa de conversão (vendas/visitas)

**Endpoint:** `GET /orders/search?seller={user_id}&order.date_created.from={date}`

**Valor para agência:**
- 📈 Crescimento: validar estratégias atuais
- 📉 Queda: vender plano de recuperação urgente
- ➡️ Estagnado: vender inovação e crescimento

---

### **3️⃣ TOP PRODUTOS (Mais Vendidos e Parados)** ⭐⭐⭐⭐⭐
**Por quê:** Mostra onde focar esforços (otimizar o que vende, reativar o que não vende)

**Dados necessários:**

**Top 20 mais vendidos (30 dias):**
- ✅ ID do produto
- ✅ Título
- ✅ Quantidade vendida
- ✅ Receita gerada
- ✅ % do total de vendas
- ✅ Preço médio de venda
- ✅ Estoque atual
- ✅ Status do anúncio (ativo/pausado)

**Produtos ZERO vendas (60 dias):**
- ✅ ID do produto
- ✅ Título
- ✅ Dias sem venda
- ✅ Estoque parado (R$)
- ✅ Visitas recebidas
- ✅ Problemas identificados (título, imagens, preço)

**Endpoint:** `GET /orders/search` + análise de `sold_quantity` por item

**Valor para agência:**
- 🎯 Produtos campeões: otimizar ainda mais (ads, variações, cross-sell)
- 💰 Produtos parados: criar promoções, melhorar anúncios, considerar descontinuar
- 📊 Análise ABC: concentrar esforços no que gera 80% da receita

---

### **4️⃣ QUALIDADE DOS ANÚNCIOS (Score Médio)** ⭐⭐⭐⭐⭐
**Por quê:** Anúncios ruins = baixa conversão = perda de vendas

**Dados necessários (TODOS OS ANÚNCIOS, não só 10!):**

**Por anúncio:**
- ✅ ID do anúncio
- ✅ Título (tamanho ideal: 55-60 caracteres)
- ✅ Categoria completa (ID + nome + caminho completo)
- ✅ Preço atual
- ✅ Preço original (se tiver promoção)
- ✅ Tipo de listagem (gold, premium, classic, free)
- ✅ Status (active, paused, closed, under_review)
- ✅ Condição (new, used, refurbished)
- ✅ Quantidade disponível
- ✅ Quantidade vendida (histórico total)
- ✅ Permalink

**Imagens:**
- ✅ Quantidade de imagens (ideal: 6-8)
- ✅ URLs de todas as imagens
- ✅ Imagem principal (thumbnail)
- ✅ Se tem imagem de fundo branco
- ✅ Se tem imagem de contexto/uso

**Descrição:**
- ✅ Se tem descrição
- ✅ Tamanho da descrição (ideal: 500+ caracteres)
- ✅ Tipo (plain text ou HTML)
- ✅ Se tem palavras-chave relevantes

**Atributos técnicos:**
- ✅ Total de atributos preenchidos
- ✅ Atributos obrigatórios faltantes
- ✅ Atributos recomendados faltantes
- ✅ Lista completa de atributos (marca, modelo, cor, tamanho, etc)

**Variações:**
- ✅ Se tem variações
- ✅ Quantidade de variações
- ✅ Tipos de variações (cor, tamanho, etc)
- ✅ Estoque por variação

**Frete:**
- ✅ Tipo de frete (me1/full, me2/flex, custom)
- ✅ Frete grátis (sim/não)
- ✅ Dimensões (altura, largura, profundidade)
- ✅ Peso
- ✅ Custo de envio

**Garantia:**
- ✅ Tipo de garantia (fabricante, seller)
- ✅ Tempo de garantia (meses)

**Visibilidade (se disponível):**
- ✅ Visitas totais
- ✅ Visitas últimos 30 dias
- ✅ Taxa de conversão (vendas/visitas)
- ✅ Health score do anúncio

**Endpoint:** 
- `GET /users/{user_id}/items/search` (pegar TODOS os IDs)
- `GET /items/{item_id}` (detalhes completos)
- `GET /items/{item_id}/description` (descrição)
- `GET /items/{item_id}/visits` (visitas - se permitido)

**Valor para agência:**
- 🏆 Score alto (90-100%): benchmarking, usar como modelo
- ⚠️ Score médio (60-89%): otimização rápida (quick wins)
- 🚨 Score baixo (<60%): venda de pacote completo de melhorias

**Análise de problemas:**
- ❌ Título curto (<40 chars) → perde visibilidade
- ❌ Poucas imagens (<4) → baixa conversão
- ❌ Sem descrição → não ranqueia bem
- ❌ Atributos faltantes → não aparece em filtros
- ❌ Sem frete grátis → perde competitividade
- ❌ Sem variações → perde vendas adicionais

---

### **5️⃣ LOGÍSTICA E FULFILLMENT** ⭐⭐⭐⭐
**Por quê:** FULL/FLEX é decisivo para competitividade

**Dados necessários:**
- ✅ Tipo de logística (FULL, FLEX, própria)
- ✅ % de produtos em FULL
- ✅ % de produtos em FLEX
- ✅ % de produtos em envio próprio
- ✅ Endereços de origem cadastrados
- ✅ Métodos de envio configurados
- ✅ Tempo médio de handling (preparação)
- ✅ Taxa de envios no prazo
- ✅ Taxa de problemas de envio
- ✅ % de anúncios com frete grátis

**Endpoint:** 
- `GET /users/{user_id}/shipping_preferences`
- `GET /shipments/metrics/{user_id}`

**Valor para agência:**
- 📦 Sem FULL/FLEX: vender migração para logística ML
- 🚚 Problemas de envio: vender consultoria de fulfillment
- ✅ Bem configurado: validar e manter

---

## 🟡 PRIORIDADE ALTA (Segunda Aba - Análise Detalhada)

### **6️⃣ CAMPANHAS PUBLICITÁRIAS** ⭐⭐⭐⭐
**Por quê:** Mostra se está investindo em ads e o ROI

**Dados necessários:**

**Por campanha:**
- ✅ ID da campanha
- ✅ Nome da campanha
- ✅ Status (active, paused, finished)
- ✅ Tipo (product_ad, store_ad)
- ✅ Budget diário
- ✅ Budget total
- ✅ Gasto atual
- ✅ Gasto últimos 30 dias
- ✅ Data de início
- ✅ Data de fim
- ✅ Produtos anunciados

**Métricas de performance:**
- ✅ Impressões (30 dias)
- ✅ Cliques (30 dias)
- ✅ CTR (Click Through Rate)
- ✅ Conversões
- ✅ CPC (Custo por Clique)
- ✅ Vendas atribuídas
- ✅ Receita gerada por ads
- ✅ ROAS (Return on Ad Spend)
- ✅ ROI (Retorno sobre Investimento)

**Endpoint:** 
- `GET /advertising/campaigns?user_id={user_id}`
- `GET /advertising/campaigns/{campaign_id}`
- `GET /advertising/campaigns/{campaign_id}/stats`

**Valor para agência:**
- 💰 Sem campanhas: vender criação de ads
- 📉 ROAS baixo (<3x): otimizar campanhas existentes
- 📈 ROAS alto: escalar investimento
- ⏸️ Campanhas pausadas: reativar com melhorias

---

### **7️⃣ PROMOÇÕES E CUPONS** ⭐⭐⭐⭐
**Por quê:** Mostra estratégia de preço e promoções

**Dados necessários:**

**Promoções (últimos 60 dias):**
- ✅ ID da promoção
- ✅ Nome da promoção
- ✅ Tipo (discount, free_shipping, bundle)
- ✅ Desconto (% ou valor fixo)
- ✅ Data de início
- ✅ Data de fim
- ✅ Status (active, inactive, scheduled, expired)
- ✅ Produtos incluídos
- ✅ Vendas geradas pela promoção
- ✅ Receita gerada
- ✅ % de desconto médio

**Cupons:**
- ✅ Código do cupom
- ✅ Desconto
- ✅ Quantidade de usos
- ✅ Limite de uso
- ✅ Usos restantes
- ✅ Validade
- ✅ Status (active, expired, depleted)
- ✅ Produtos aplicáveis
- ✅ Vendas geradas por cupom

**Endpoint:** 
- `GET /loyalty/promotion_pack?seller_id={user_id}`
- `GET /coupons?seller_id={user_id}`

**Valor para agência:**
- 🎁 Sem promoções: vender estratégia promocional
- 📊 Promoções ineficientes: otimizar descontos
- ✅ Promoções eficientes: escalar e criar calendário

---

### **8️⃣ PERGUNTAS E ATENDIMENTO** ⭐⭐⭐⭐
**Por quê:** Tempo de resposta afeta reputação e conversão

**Dados necessários:**
- ✅ Total de perguntas recebidas (30 dias)
- ✅ Total de perguntas recebidas (60 dias)
- ✅ Perguntas respondidas
- ✅ Perguntas não respondidas
- ✅ Taxa de resposta (% respondidas)
- ✅ Tempo médio de resposta (horas)
- ✅ Tempo mediano de resposta
- ✅ Perguntas por produto (top 10)
- ✅ Palavras-chave mais frequentes
- ✅ Perguntas mais antigas sem resposta

**Endpoint:** 
- `GET /questions/search?seller_id={user_id}`
- `GET /questions/search?item={item_id}`

**Valor para agência:**
- ⏱️ Tempo alto (>24h): vender automação/chatbot
- ❌ Taxa baixa (<90%): vender consultoria de atendimento
- ✅ Bom atendimento: manter e monitorar

---

### **9️⃣ RECLAMAÇÕES (CLAIMS)** ⭐⭐⭐⭐
**Por quê:** Claims afetam reputação e podem bloquear conta

**Dados necessários:**
- ✅ Total de claims (30 dias)
- ✅ Total de claims (60 dias)
- ✅ Claims abertas
- ✅ Claims fechadas
- ✅ Claims ganhas pelo seller
- ✅ Claims ganhas pelo comprador
- ✅ Motivo do claim (produto diferente, não chegou, defeito, etc)
- ✅ Status do claim (open, closed, in_mediation)
- ✅ Produto reclamado
- ✅ Valor total em disputa
- ✅ Tempo médio de resolução
- ✅ Taxa de resolução favorável

**Endpoint:** 
- `GET /claims/search?seller_id={user_id}`
- `GET /claims/{claim_id}`

**Valor para agência:**
- 🚨 Claims altos: vender consultoria de qualidade/logística
- ⚠️ Produtos específicos com claims: descontinuar ou melhorar
- ✅ Claims baixos: manter padrão de qualidade

---

### **🔟 MENSAGENS (CHAT)** ⭐⭐⭐
**Por quê:** Afeta conversão e satisfação

**Dados necessários:**
- ✅ Total de conversas (30 dias)
- ✅ Mensagens não lidas
- ✅ Tempo médio de primeira resposta
- ✅ Tempo médio de resposta geral
- ✅ Taxa de resposta
- ✅ Conversas por produto

**Endpoint:** 
- `GET /messages/packs?seller={user_id}`

**Valor para agência:**
- 💬 Tempo alto: vender automação de respostas
- 📧 Taxa baixa: vender consultoria de atendimento

---

## 🟢 PRIORIDADE MÉDIA (Terceira Aba - Business Intelligence)

### **1️⃣1️⃣ VISITAS E CONVERSÃO** ⭐⭐⭐
**Por quê:** Mostra eficácia dos anúncios

**Dados necessários (por produto):**
- ✅ Visitas totais
- ✅ Visitas últimos 30 dias
- ✅ Visitas únicas
- ✅ Taxa de conversão (vendas/visitas)
- ✅ Origem do tráfego (orgânico, pago, direto)

**Endpoint:** 
- `GET /items/{item_id}/visits`
- `GET /items/{item_id}/visits/time_window`

**Valor para agência:**
- 👀 Alto tráfego + baixa conversão: otimizar anúncio (preço, descrição, imagens)
- 👀 Baixo tráfego: investir em ads ou SEO
- ✅ Alta conversão: escalar tráfego

---

### **1️⃣2️⃣ ANÁLISE DE CATEGORIAS** ⭐⭐⭐
**Por quê:** Mostra oportunidades de expansão

**Dados necessários:**
- ✅ Categorias em que vende
- ✅ % de vendas por categoria
- ✅ Receita por categoria
- ✅ Comissão média por categoria
- ✅ Produtos mais vendidos na categoria (benchmark ML)
- ✅ Tendências da categoria
- ✅ Preço médio da categoria
- ✅ Oportunidades de mercado

**Endpoint:** 
- `GET /categories/{category_id}`
- `GET /trends/{category_id}`
- `GET /sites/MLB/search?category={cat_id}&sort=sold_quantity_desc`

**Valor para agência:**
- 📈 Categoria em alta: expandir sortimento
- 📉 Categoria em queda: diversificar
- 💡 Oportunidades: lançar produtos em demanda

---

### **1️⃣3️⃣ ANÁLISE FINANCEIRA** ⭐⭐⭐
**Por quê:** Mostra saúde financeira do negócio

**Dados necessários:**
- ✅ Saldo disponível
- ✅ Saldo a liberar
- ✅ Comissões pagas ao ML (30 dias)
- ✅ Comissões pagas ao ML (60 dias)
- ✅ Custo médio de comissão (%)
- ✅ Custos de frete
- ✅ Custos de ads
- ✅ Receita líquida estimada

**Endpoint:** 
- `GET /mercadopago/account/{user_id}`

**Valor para agência:**
- 💰 Comissões altas: vender produtos de maior margem
- 📊 Análise de margem: otimizar mix de produtos

---

## 📋 RESUMO EXECUTIVO: O QUE PUXAR NO LOGIN

### **🔴 CRÍTICO (Primeira Tela - Dashboard Executivo):**
1. ✅ Health Score da Conta (reputação, status, riscos)
2. ✅ Performance 30 vs 60 dias (vendas, receita, crescimento)
3. ✅ Top 20 produtos mais vendidos
4. ✅ Produtos parados (zero vendas 60 dias)
5. ✅ Qualidade média dos anúncios (score)
6. ✅ Logística (FULL/FLEX/própria)

### **🟡 IMPORTANTE (Segunda Tela - Análise Detalhada):**
7. ✅ Campanhas publicitárias (ativas, ROAS, ROI)
8. ✅ Promoções e cupons (últimos 60 dias)
9. ✅ Perguntas (tempo de resposta, taxa de resposta)
10. ✅ Reclamações (claims abertos, taxa de resolução)
11. ✅ Mensagens (tempo de resposta)

### **🟢 COMPLEMENTAR (Business Intelligence):**
12. ✅ Visitas e conversão por produto
13. ✅ Análise de categorias e tendências
14. ✅ Análise financeira (comissões, margem)

---

## 🎯 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: MVP Aprimorado (Semana 1)**
1. ✅ Puxar TODOS os anúncios (não só 10)
2. ✅ Adicionar dados completos por anúncio (categoria, imagens, atributos, variações)
3. ✅ Comparativo 30 vs 60 dias (vendas, receita)
4. ✅ Health Score visual (semáforo)
5. ✅ Top 20 produtos + produtos parados

### **FASE 2: Análise Avançada (Semana 2)**
6. ✅ Campanhas publicitárias completas
7. ✅ Promoções e cupons
8. ✅ Perguntas e tempo de resposta
9. ✅ Reclamações (claims)

### **FASE 3: Business Intelligence (Semana 3)**
10. ✅ Visitas e conversão
11. ✅ Análise de categorias
12. ✅ Análise financeira
13. ✅ Dashboard visual com gráficos

### **FASE 4: Automação e Alertas (Semana 4)**
14. ✅ Alertas automáticos (reputação baixa, claims altos)
15. ✅ Relatório PDF exportável
16. ✅ Comparação com benchmarks de mercado
17. ✅ Plano de ação automático

---

## 💡 INSIGHTS PARA AGÊNCIA (Como usar os dados)

### **🚨 ALERTAS VERMELHOS (Venda Urgente):**
- Reputação amarela/vermelha → Consultoria de recuperação
- Taxa de cancelamento >2% → Auditoria de processos
- Claims >1% → Auditoria de qualidade/logística
- Produtos parados com estoque alto → Liquidação estratégica
- Sem FULL/FLEX → Migração para logística ML

### **⚠️ OPORTUNIDADES (Venda de Otimização):**
- Score de anúncios <80% → Pacote de otimização
- ROAS <3x → Consultoria de ads
- Tempo de resposta >12h → Automação/chatbot
- Sem promoções → Calendário promocional
- Baixa conversão → Testes A/B de preço/descrição

### **✅ CRESCIMENTO (Venda de Expansão):**
- Alta conversão → Escalar ads
- Produtos campeões → Criar variações/bundles
- Categoria em alta → Expandir sortimento
- Reputação verde → Marketplace em outros países

---

## 🎬 PRÓXIMOS PASSOS

**Agora você decide:**

1. **Quais dados são ESSENCIAIS para a primeira versão?**
2. **Qual a ordem de prioridade de implementação?**
3. **Quer começar pela Fase 1 (MVP Aprimorado)?**

**Estou pronto para implementar o que você decidir!** 🚀


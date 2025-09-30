# 📊 DADOS DISPONÍVEIS - MERCADO LIVRE API

## 🎯 OBJETIVO
Criar diagnóstico completo de sellers para reuniões comerciais de agência.

---

## 📋 CATEGORIAS DE DADOS

### 1️⃣ INFORMAÇÕES DA CONTA (USER)
**Endpoint:** `GET /users/{user_id}`

**Dados disponíveis:**
- ✅ ID do usuário
- ✅ Nickname
- ✅ Email
- ✅ Status da conta (active, inactive, blocked)
- ✅ Site ID (MLB - Brasil, MLA - Argentina, etc)
- ✅ Tipo de conta (normal, premium, brand)
- ✅ Data de registro
- ✅ Permalink da conta
- ✅ País, estado, cidade
- ✅ CPF/CNPJ (se disponível)
- ✅ Telefone (se disponível)
- ✅ Logo da loja
- ✅ Status de verificação (verificado, não verificado)

**Dados de vendedor (seller_reputation):**
- ✅ Nível do vendedor (mercadolíder, mercadolíder platinum)
- ✅ Power seller status
- ✅ Transações completadas (total, canceladas, período)
- ✅ Ratings (positivo, negativo, neutro)
- ✅ Claims (reclamos)
- ✅ Delayed handling time (atrasos)
- ✅ Sales metrics (vendas por período)

---

### 2️⃣ REPUTAÇÃO DETALHADA
**Endpoint:** `GET /users/{user_id}/reputation`

**Dados disponíveis:**
- ✅ Nível de reputação (green, yellow, red)
- ✅ Score de reputação (0-100)
- ✅ Transações completadas
- ✅ Transações canceladas (%)
- ✅ Claims (reclamos recebidos)
- ✅ Delayed handling time (% de atrasos)
- ✅ Not yet rated (% sem avaliação)
- ✅ Métricas por período (60 dias, 1 ano)

---

### 3️⃣ LOGÍSTICA E ENVIOS (FULL/FLEX)
**Endpoint:** `GET /users/{user_id}/shipping_preferences`

**Dados disponíveis:**
- ✅ Tipo de logística (FULL, FLEX, própria)
- ✅ Endereços de origem
- ✅ Métodos de envio configurados
- ✅ Custo de envio (gratuito, pago)
- ✅ Tempo de handling (preparação)
- ✅ Status da logística (ativa, inativa)

**Endpoint:** `GET /shipments/metrics/{user_id}`
- ✅ Taxa de entregas no prazo
- ✅ Taxa de problemas de envio
- ✅ Tempo médio de handling

---

### 4️⃣ ANÚNCIOS (ITEMS)
**Endpoint:** `GET /users/{user_id}/items/search`
**Endpoint:** `GET /items/{item_id}`

**Dados por anúncio:**
- ✅ ID do anúncio
- ✅ Título (60 caracteres max)
- ✅ Categoria ID + nome completo
- ✅ Preço atual
- ✅ Preço original (se em promoção)
- ✅ Moeda
- ✅ Quantidade disponível
- ✅ Quantidade vendida (total histórico)
- ✅ Status (active, paused, closed, under_review)
- ✅ Tipo de listagem (gold, premium, free, classic)
- ✅ Condição (new, used)
- ✅ Permalink
- ✅ Thumbnail (imagem principal)

**Imagens:**
- ✅ Quantidade de imagens (ideal: 6-8)
- ✅ URLs de todas as imagens
- ✅ Qualidade/resolução

**Descrição:**
- ✅ Texto da descrição (plain text ou HTML)
- ✅ Comprimento da descrição
- ✅ Presença de descrição

**Atributos técnicos:**
- ✅ Lista completa de atributos (marca, modelo, cor, tamanho, etc)
- ✅ Atributos obrigatórios faltantes
- ✅ Atributos opcionais preenchidos

**Variações:**
- ✅ Se tem variações (tamanho, cor)
- ✅ Quantidade de variações
- ✅ Estoque por variação

**Frete:**
- ✅ Tipo de frete (me1, me2, custom)
- ✅ Frete grátis (sim/não)
- ✅ Dimensões e peso

**Garantia:**
- ✅ Tipo de garantia
- ✅ Tempo de garantia

**Visibilidade:**
- ✅ Visitas totais (se disponível via metrics)
- ✅ Conversão (vendas/visitas)

**Saúde do anúncio:**
- ✅ Health score (se disponível)
- ✅ Recomendações de melhoria

---

### 5️⃣ VENDAS E PEDIDOS (ORDERS)
**Endpoint:** `GET /orders/search?seller={user_id}`

**Filtros importantes:**
- ✅ Data de criação (últimos 30, 60, 90 dias)
- ✅ Status do pedido (paid, shipped, delivered, cancelled)

**Dados por pedido:**
- ✅ ID do pedido
- ✅ Data de criação
- ✅ Data de pagamento
- ✅ Data de envio
- ✅ Data de entrega
- ✅ Status do pedido
- ✅ Status do pagamento
- ✅ Método de pagamento
- ✅ Valor total
- ✅ Valor do frete
- ✅ Comissão do ML
- ✅ Itens vendidos (ID, título, quantidade, preço unitário)
- ✅ Comprador (ID, nickname)
- ✅ Endereço de entrega
- ✅ Status do envio

**Análises possíveis:**
- ✅ Top 10/20/50 produtos mais vendidos
- ✅ Receita total por período
- ✅ Ticket médio
- ✅ Taxa de cancelamento
- ✅ Taxa de conversão
- ✅ Produtos com melhor margem
- ✅ Produtos com mais reclamações
- ✅ Análise de sazonalidade
- ✅ Horários de pico de vendas
- ✅ Produtos que vendem juntos (cross-sell)

---

### 6️⃣ PERGUNTAS (QUESTIONS)
**Endpoint:** `GET /questions/search?item={item_id}`
**Endpoint:** `GET /questions/search?seller_id={user_id}`

**Dados:**
- ✅ Total de perguntas recebidas
- ✅ Tempo médio de resposta
- ✅ Taxa de resposta
- ✅ Perguntas não respondidas
- ✅ Perguntas por produto
- ✅ Palavras-chave mais frequentes (análise manual)

---

### 7️⃣ CAMPANHAS PUBLICITÁRIAS (ADS)
**Endpoint:** `GET /advertising/campaigns?user_id={user_id}`
**Endpoint:** `GET /advertising/campaigns/{campaign_id}`

**Dados por campanha:**
- ✅ ID da campanha
- ✅ Nome da campanha
- ✅ Status (active, paused, finished)
- ✅ Tipo de campanha (product_ad, store_ad)
- ✅ Budget diário/total
- ✅ Gasto atual
- ✅ Data de início
- ✅ Data de fim
- ✅ Produtos anunciados

**Métricas de performance:**
- ✅ Impressões
- ✅ Cliques
- ✅ CTR (Click Through Rate)
- ✅ Conversões
- ✅ CPC (Custo por Clique)
- ✅ ROI (Retorno sobre Investimento)
- ✅ ROAS (Return on Ad Spend)

---

### 8️⃣ PROMOÇÕES E CUPONS (PROMOTIONS)
**Endpoint:** `GET /loyalty/promotion_pack?seller_id={user_id}`
**Endpoint:** `GET /coupons?seller_id={user_id}`

**Promoções:**
- ✅ ID da promoção
- ✅ Nome da promoção
- ✅ Tipo (discount, free_shipping, bundle)
- ✅ Desconto (% ou valor fixo)
- ✅ Data de início
- ✅ Data de fim
- ✅ Status (active, inactive, scheduled)
- ✅ Produtos incluídos
- ✅ Vendas geradas pela promoção

**Cupons:**
- ✅ Código do cupom
- ✅ Desconto
- ✅ Quantidade de usos
- ✅ Limite de uso
- ✅ Validade
- ✅ Status (active, expired)
- ✅ Produtos aplicáveis

---

### 9️⃣ CLAIMS (RECLAMAÇÕES)
**Endpoint:** `GET /claims/search?seller_id={user_id}`

**Dados:**
- ✅ Total de reclamações
- ✅ Reclamações abertas
- ✅ Reclamações fechadas
- ✅ Motivo da reclamação
- ✅ Status da reclamação
- ✅ Produto reclamado
- ✅ Tempo médio de resolução
- ✅ Taxa de resolução

---

### 🔟 MENSAGENS E ATENDIMENTO
**Endpoint:** `GET /messages/packs?seller={user_id}`

**Dados:**
- ✅ Total de mensagens
- ✅ Mensagens não lidas
- ✅ Tempo médio de resposta
- ✅ Taxa de resposta

---

### 1️⃣1️⃣ VISITANTES E TRÁFEGO (VISITS/METRICS)
**Endpoint:** `GET /items/{item_id}/visits` (requer permissões especiais)
**Endpoint:** `GET /items/{item_id}/visits/time_window` (últimos X dias)

**Dados:**
- ✅ Visitas totais por anúncio
- ✅ Visitas únicas
- ✅ Taxa de conversão (vendas/visitas)
- ✅ Origem do tráfego (orgânico, pago, direto)

---

### 1️⃣2️⃣ CATEGORIAS E MARKETPLACE
**Endpoint:** `GET /categories/{category_id}`
**Endpoint:** `GET /sites/MLB/categories`

**Dados:**
- ✅ Árvore de categorias
- ✅ Atributos obrigatórios por categoria
- ✅ Atributos recomendados
- ✅ Comissões por categoria
- ✅ Produtos mais vendidos na categoria

---

### 1️⃣3️⃣ PAGAMENTOS E FINANCEIRO
**Endpoint:** `GET /mercadopago/account/{user_id}`

**Dados:**
- ✅ Saldo disponível
- ✅ Saldo a liberar
- ✅ Transações financeiras
- ✅ Comissões pagas ao ML
- ✅ Histórico de saques

---

### 1️⃣4️⃣ TRENDS E OPORTUNIDADES
**Endpoint:** `GET /trends/{category_id}`
**Endpoint:** `GET /sites/MLB/search?category={cat_id}&sort=sold_quantity_desc`

**Dados:**
- ✅ Produtos em alta na categoria
- ✅ Palavras-chave em alta
- ✅ Preço médio na categoria
- ✅ Oportunidades de mercado

---

## 🎯 ANÁLISES RECOMENDADAS PARA AGÊNCIA

### 📊 Dashboard Executivo
1. **Resumo da conta:** Nível vendedor, reputação, tempo de atividade
2. **Performance últimos 30 dias:** Vendas, receita, ticket médio
3. **Saúde da loja:** Score geral, problemas críticos
4. **Oportunidades:** Top 3 ações recomendadas

### 📈 Análise de Vendas
1. **Top 20 produtos mais vendidos** (últimos 30 e 60 dias)
2. **Produtos com queda de vendas** (comparativo 30 vs 60 dias)
3. **Produtos sem vendas** (últimos 60 dias)
4. **Análise de margem** (produtos mais rentáveis)
5. **Sazonalidade** (dias/horários de pico)
6. **Cross-sell** (produtos vendidos juntos)

### 🏆 Qualidade dos Anúncios
1. **Score médio dos anúncios**
2. **Anúncios com problemas:**
   - Título curto (< 40 caracteres)
   - Poucas imagens (< 4)
   - Sem descrição ou descrição curta
   - Atributos faltantes
   - Sem variações (quando aplicável)
   - Sem frete grátis
3. **Anúncios com melhor performance** (conversão)
4. **Anúncios inativos** (pausados ou sem estoque)

### 💰 ROI Publicitário
1. **Campanhas ativas vs inativas**
2. **Gasto vs Receita por campanha**
3. **ROAS por produto**
4. **Produtos sem anúncios** (oportunidade)
5. **Palavras-chave com melhor performance**

### 🎁 Estratégias Promocionais
1. **Promoções ativas** (últimos 60 dias)
2. **Performance de promoções** (vendas geradas)
3. **Cupons ativos e expirados**
4. **Taxa de uso de cupons**
5. **Oportunidades de promoção** (produtos parados)

### 📞 Atendimento
1. **Tempo médio de resposta**
2. **Taxa de resposta**
3. **Perguntas mais frequentes** (por produto e geral)
4. **Perguntas não respondidas**

### ⚠️ Problemas e Riscos
1. **Reclamações abertas**
2. **Taxa de cancelamento**
3. **Taxa de atrasos**
4. **Produtos com muitas reclamações**
5. **Riscos de bloqueio da conta**

### 🚀 Plano de Ação Sugerido
1. **Quick wins** (ações rápidas, alto impacto)
2. **Médio prazo** (30-60 dias)
3. **Estratégias de crescimento** (90+ dias)

---

## ⚙️ IMPLEMENTAÇÃO TÉCNICA

### Prioridade 1 (MVP - Essencial para reunião)
- [ ] Dados da conta + reputação
- [ ] Top 20 produtos vendidos (30 dias)
- [ ] Análise de qualidade dos anúncios
- [ ] Campanhas ativas
- [ ] Promoções ativas
- [ ] Problemas críticos

### Prioridade 2 (Análise avançada)
- [ ] Comparativo 30 vs 60 dias
- [ ] Análise de margem
- [ ] Perguntas frequentes
- [ ] Reclamações
- [ ] Visitantes e conversão

### Prioridade 3 (Business Intelligence)
- [ ] Sazonalidade
- [ ] Cross-sell
- [ ] Trends e oportunidades
- [ ] Benchmarking com categoria

---

## 📝 PRÓXIMOS PASSOS
1. **Você define:** Quais dados são ESSENCIAIS para a primeira versão?
2. **Eu implemento:** APIs, análises e dashboard
3. **Você valida:** Teste com conta real
4. **Iteramos:** Refinamos baseado no feedback

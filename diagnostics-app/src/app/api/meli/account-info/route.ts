import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Account Info API - Baseado na lógica da biblioteca
 * Inclui análise de reputação e sugestões automáticas
 */

interface ReputationInsight {
  type: string;
  message: string;
  severity: 'success' | 'warning' | 'critical';
  icon: string;
}

interface ImprovementSuggestion {
  type: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  icon: string;
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const jar = await cookies();
    const tokenCookie = jar.get("meli_token");
    
    if (!tokenCookie) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const token = JSON.parse(tokenCookie.value);
    const accessToken = token.access_token;
    const userId = token.user_id;

    // 1. Buscar informações do usuário
    const userRes = await fetch(`https://api.mercadolibre.com/users/${userId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      const text = await userRes.text();
      return NextResponse.json({ 
        ok: false, 
        error: `Falha ao buscar usuário: ${userRes.status} ${text}` 
      }, { status: userRes.status });
    }

    const user = await userRes.json();

    // 2. Buscar informações de envio (Full/Flex)
    const shippingRes = await fetch(`https://api.mercadolibre.com/users/${userId}/shipping_preferences`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    let shipping = null;
    if (shippingRes.ok) {
      shipping = await shippingRes.json();
    }

    // 3. Buscar reputação
    const reputationRes = await fetch(`https://api.mercadolibre.com/users/${userId}/reputation`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    let reputation = null;
    if (reputationRes.ok) {
      reputation = await reputationRes.json();
    }

    // Gerar insights e sugestões baseadas na reputação
    const insights = generateReputationInsights(user, reputation);
    const suggestions = generateImprovementSuggestions(user, reputation);

    return NextResponse.json({ 
      ok: true, 
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        seller_reputation: user.seller_reputation,
        status: user.status,
        site_id: user.site_id,
        permalink: user.permalink,
        registration_date: user.registration_date,
      },
      shipping,
      reputation,
      insights,
      improvement_suggestions: suggestions,
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro ao buscar informações da conta";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * Gera insights sobre a reputação - BASEADO NA BIBLIOTECA
 */
function generateReputationInsights(user: any, reputation: any): ReputationInsight[] {
  const insights: ReputationInsight[] = [];

  if (!reputation) return insights;

  // Análise de nível
  const levelId = reputation.level_id;
  if (levelId === '5_green') {
    insights.push({
      type: 'excellent_reputation',
      message: 'Reputação excelente! Continue mantendo os padrões de qualidade.',
      severity: 'success',
      icon: '🏆'
    });
  } else if (levelId === '4_light_green') {
    insights.push({
      type: 'good_reputation',
      message: 'Boa reputação, mas há espaço para melhorias.',
      severity: 'success',
      icon: '✅'
    });
  } else if (levelId === '3_yellow') {
    insights.push({
      type: 'moderate_reputation',
      message: 'Reputação moderada. Atenção necessária para evitar problemas.',
      severity: 'warning',
      icon: '⚠️'
    });
  } else if (levelId === '2_orange' || levelId === '1_red') {
    insights.push({
      type: 'critical_reputation',
      message: 'Reputação crítica! Ação imediata necessária para evitar bloqueio.',
      severity: 'critical',
      icon: '🚨'
    });
  }

  // Análise de transações
  const transactions = reputation.transactions || {};
  const total = transactions.total || 0;
  const completed = transactions.completed || 0;
  const canceled = transactions.canceled || 0;
  
  if (total > 0) {
    const cancelRate = (canceled / total) * 100;
    if (cancelRate > 2) {
      insights.push({
        type: 'high_cancellation',
        message: `Taxa de cancelamento de ${cancelRate.toFixed(1)}% está acima do ideal (2%)`,
        severity: 'warning',
        icon: '❌'
      });
    }
  }

  // Análise de claims
  const metrics = reputation.metrics || {};
  const claims = metrics.claims || {};
  const claimsRate = claims.rate || 0;
  
  if (claimsRate > 0.01) { // > 1%
    insights.push({
      type: 'high_claims',
      message: `Taxa de reclamações de ${(claimsRate * 100).toFixed(2)}% está acima do ideal (1%)`,
      severity: 'critical',
      icon: '⚠️'
    });
  }

  // Análise de delayed handling
  const delayedHandling = metrics.delayed_handling_time || {};
  const delayedRate = delayedHandling.rate || 0;
  
  if (delayedRate > 0.05) { // > 5%
    insights.push({
      type: 'shipping_delays',
      message: `${(delayedRate * 100).toFixed(1)}% dos envios com atraso. Otimize processos de preparação.`,
      severity: 'warning',
      icon: '📦'
    });
  }

  return insights;
}

/**
 * Gera sugestões de melhoria - BASEADO NA BIBLIOTECA
 */
function generateImprovementSuggestions(user: any, reputation: any): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  if (!reputation) return suggestions;

  const levelId = reputation.level_id;
  const powerSeller = reputation.power_seller_status;

  // Sugestão de nível
  if (levelId && levelId < '5_green') {
    suggestions.push({
      type: 'level_improvement',
      suggestion: 'Foque em melhorar o tempo de entrega e comunicação para subir de nível',
      impact: 'high',
      icon: '📈'
    });
  }

  // Sugestão de Power Seller
  if (!powerSeller) {
    suggestions.push({
      type: 'power_seller',
      suggestion: 'Trabalhe para se tornar Power Seller e ganhar destaque nos resultados',
      impact: 'high',
      icon: '⚡'
    });
  }

  // Análise de ratings
  const ratings = reputation.ratings || {};
  const negative = ratings.negative || 0;
  
  if (negative > 5) {
    suggestions.push({
      type: 'negative_reviews',
      suggestion: 'Analise avaliações negativas e implemente melhorias no atendimento',
      impact: 'high',
      icon: '💬'
    });
  }

  // Análise de claims
  const metrics = reputation.metrics || {};
  const claims = metrics.claims || {};
  const claimsValue = claims.value || 0;
  
  if (claimsValue > 0) {
    suggestions.push({
      type: 'reduce_claims',
      suggestion: 'Audite qualidade dos produtos e logística para reduzir reclamações',
      impact: 'high',
      icon: '🔍'
    });
  }

  // Análise de delayed handling
  const delayedHandling = metrics.delayed_handling_time || {};
  const delayedValue = delayedHandling.value || 0;
  
  if (delayedValue > 0) {
    suggestions.push({
      type: 'shipping_optimization',
      suggestion: 'Otimize processos de preparação e envio para reduzir atrasos',
      impact: 'medium',
      icon: '🚚'
    });
  }

  // Análise de sales
  const sales = reputation.sales || {};
  const period = sales.period || 'unknown';
  const completed_sales = sales.completed || 0;
  
  if (completed_sales < 10) {
    suggestions.push({
      type: 'increase_sales',
      suggestion: 'Aumente volume de vendas para melhorar reputação e visibilidade',
      impact: 'medium',
      icon: '💰'
    });
  }

  return suggestions;
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Ads/Items Analysis API - Baseado na lógica da biblioteca
 * Busca TODOS os anúncios e faz análise completa de qualidade
 */

interface ItemAnalysis {
  id: string;
  title: string;
  category_id: string;
  category_name: string;
  status: string;
  listing_type_id: string;
  condition: string;
  price: number;
  original_price: number | null;
  available_quantity: number;
  sold_quantity: number;
  permalink: string;
  thumbnail: string;
  
  // Imagens
  images_count: number;
  has_white_background: boolean;
  
  // Descrição
  has_description: boolean;
  description_length: number;
  
  // Atributos
  attributes_count: number;
  required_attributes_missing: string[];
  
  // Variações
  has_variations: boolean;
  variations_count: number;
  
  // Frete
  shipping_mode: string;
  shipping_free: boolean;
  
  // Garantia
  warranty: string | null;
  
  // Score de qualidade
  quality_score: number;
  missing_fields: string[];
  improvement_suggestions: string[];
}

export async function GET(): Promise<NextResponse> {
  try {
    const jar = await cookies();
    const tokenCookie = jar.get("meli_token");
    
    if (!tokenCookie) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const token = JSON.parse(tokenCookie.value);
    const accessToken: string = String(token.access_token);
    const userId: string = String(token.user_id); // garantir tipo string

    // Buscar TODOS os anúncios (não só 10!)
    const searchRes = await fetch(
      `https://api.mercadolibre.com/users/${userId}/items/search?limit=200`,
      {
        headers: { "Authorization": `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    if (!searchRes.ok) {
      const text = await searchRes.text();
      return NextResponse.json({ 
        ok: false, 
        error: `Falha ao buscar anúncios: ${searchRes.status} ${text}` 
      }, { status: searchRes.status });
    }

    const searchData = await searchRes.json();
    const itemIds: string[] = searchData.results || [];

    // Buscar detalhes de TODOS os anúncios
    const itemsDetails: ItemAnalysis[] = [];
    
    // Buscar em lotes de 20 (API do ML aceita batch)
    for (let i = 0; i < itemIds.length; i += 20) {
      const batch = itemIds.slice(i, i + 20);
      const batchIds = batch.join(',');
      
      const itemsRes = await fetch(
        `https://api.mercadolibre.com/items?ids=${batchIds}`,
        { cache: "no-store" }
      );
      
      if (itemsRes.ok) {
        const items = await itemsRes.json();
        
        for (const itemResponse of items) {
          if (itemResponse.code === 200 && itemResponse.body) {
            const item = itemResponse.body;
            const analysis = analyzeItem(item);
            itemsDetails.push(analysis);
          }
        }
      }
    }

    // Calcular score médio
    const avgQualityScore = itemsDetails.length > 0
      ? itemsDetails.reduce((sum, item) => sum + item.quality_score, 0) / itemsDetails.length
      : 0;

    // Contar problemas comuns
    const commonIssues = getCommonIssues(itemsDetails);

    return NextResponse.json({ 
      ok: true, 
      total: itemIds.length,
      analyzed: itemsDetails.length,
      avg_quality_score: Math.round(avgQualityScore),
      common_issues: commonIssues,
      items: itemsDetails,
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro ao buscar anúncios";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * Analisa um item completo - BASEADO NA BIBLIOTECA
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function analyzeItem(item: any): ItemAnalysis {
  const missingFields: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Análise de título
  const titleLength = item.title?.length || 0;
  if (titleLength < 40) {
    missingFields.push("Título muito curto");
    suggestions.push("Aumente o título para 55-60 caracteres com palavras-chave");
    score -= 15;
  }

  // Análise de imagens
  const imagesCount = item.pictures?.length || 0;
  if (imagesCount < 4) {
    missingFields.push("Poucas imagens");
    suggestions.push("Adicione pelo menos 6 imagens de alta qualidade");
    score -= 20;
  }
  if (imagesCount < 6) {
    suggestions.push("Ideal ter 6-8 imagens mostrando todos os ângulos");
    score -= 5;
  }

  // Verificar fundo branco
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasWhiteBackground = item.pictures?.some((p: any) => 
    p.id?.includes('white') || p.url?.includes('white')
  ) || false;

  // Análise de atributos
  const attributesCount = item.attributes?.length || 0;
  if (attributesCount < 5) {
    missingFields.push("Poucos atributos técnicos");
    suggestions.push("Preencha todos os atributos obrigatórios e recomendados");
    score -= 15;
  }

  // Análise de variações
  const hasVariations = !!item.variations && item.variations.length > 0;
  const variationsCount = item.variations?.length || 0;

  // Análise de frete
  const shippingFree = item.shipping?.free_shipping || false;
  const shippingMode = item.shipping?.mode || 'custom';
  
  if (!shippingFree) {
    suggestions.push("Considere ativar frete grátis para aumentar conversão");
    score -= 10;
  }
  
  if (shippingMode === 'custom') {
    suggestions.push("Migrar para FULL ou FLEX melhora visibilidade e conversão");
    score -= 5;
  }

  // Análise de garantia
  const warranty = item.warranty || null;
  if (!warranty) {
    suggestions.push("Adicionar garantia aumenta confiança do comprador");
    score -= 5;
  }

  // Garantir score mínimo de 0
  score = Math.max(0, score);

  return {
    id: item.id,
    title: item.title,
    category_id: item.category_id,
    category_name: item.category_id, // TODO: buscar nome real
    status: item.status,
    listing_type_id: item.listing_type_id,
    condition: item.condition,
    price: item.price,
    original_price: item.original_price,
    available_quantity: item.available_quantity,
    sold_quantity: item.sold_quantity,
    permalink: item.permalink,
    thumbnail: item.thumbnail,
    
    images_count: imagesCount,
    has_white_background: hasWhiteBackground,
    
    has_description: !!item.description,
    description_length: 0, // TODO: buscar descrição separadamente
    
    attributes_count: attributesCount,
    required_attributes_missing: [], // TODO: comparar com categoria
    
    has_variations: hasVariations,
    variations_count: variationsCount,
    
    shipping_mode: shippingMode,
    shipping_free: shippingFree,
    
    warranty: warranty,
    
    quality_score: score,
    missing_fields: missingFields,
    improvement_suggestions: suggestions,
  };
}

/**
 * Identifica problemas comuns em todos os anúncios
 */
function getCommonIssues(items: ItemAnalysis[]): Record<string, number> {
  const issues: Record<string, number> = {
    'title_too_short': 0,
    'few_images': 0,
    'no_description': 0,
    'few_attributes': 0,
    'no_free_shipping': 0,
    'custom_shipping': 0,
    'no_variations': 0,
    'no_warranty': 0,
  };

  for (const item of items) {
    if (item.title.length < 40) issues['title_too_short']++;
    if (item.images_count < 4) issues['few_images']++;
    if (!item.has_description) issues['no_description']++;
    if (item.attributes_count < 5) issues['few_attributes']++;
    if (!item.shipping_free) issues['no_free_shipping']++;
    if (item.shipping_mode === 'custom') issues['custom_shipping']++;
    if (!item.has_variations) issues['no_variations']++;
    if (!item.warranty) issues['no_warranty']++;
  }

  return issues;
}

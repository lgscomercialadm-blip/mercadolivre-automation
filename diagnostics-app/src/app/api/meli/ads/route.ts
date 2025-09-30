import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // Buscar todos os anúncios do usuário
    const searchRes = await fetch(
      `https://api.mercadolibre.com/users/${userId}/items/search?status=active&limit=50`,
      {
        headers: { "Authorization": `Bearer ${accessToken}` },
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
    const itemIds = searchData.results || [];

    // Buscar detalhes de cada anúncio
    const itemsDetails = [];
    for (const itemId of itemIds.slice(0, 10)) { // Limitando a 10 para não demorar muito
      const itemRes = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
      });
      
      if (itemRes.ok) {
        const item = await itemRes.json();
        
        // Análise do anúncio
        const analysis = {
          id: item.id,
          title: item.title,
          status: item.status,
          price: item.price,
          available_quantity: item.available_quantity,
          sold_quantity: item.sold_quantity,
          permalink: item.permalink,
          // Análise de campos
          has_description: !!item.descriptions,
          images_count: item.pictures?.length || 0,
          attributes_count: item.attributes?.length || 0,
          missing_fields: [] as string[],
        };

        // Verificar campos obrigatórios faltantes
        if (!item.title || item.title.length < 10) {
          analysis.missing_fields.push("Título muito curto");
        }
        if (!item.pictures || item.pictures.length < 3) {
          analysis.missing_fields.push("Menos de 3 imagens");
        }
        if (!item.attributes || item.attributes.length < 3) {
          analysis.missing_fields.push("Poucos atributos técnicos");
        }

        itemsDetails.push(analysis);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      total: itemIds.length,
      items: itemsDetails,
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro ao buscar anúncios";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

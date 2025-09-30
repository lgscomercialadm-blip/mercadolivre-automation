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
      },
      shipping,
      reputation,
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro ao buscar informações da conta";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

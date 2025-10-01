import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(): Promise<NextResponse> {
  try {
    const jar = await cookies();
    const tokenCookie = jar.get("meli_token");
    
    if (!tokenCookie) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const token = JSON.parse(tokenCookie.value);
    const accessToken = token.access_token;

    // Criar usuário de teste para Brasil (MLB)
    const res = await fetch("https://api.mercadolibre.com/users/test_user", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_id: "MLB" // Brasil
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ 
        ok: false, 
        error: `Falha ao criar usuário de teste: ${res.status} ${text}` 
      }, { status: res.status });
    }

    const testUser = await res.json();
    return NextResponse.json({ ok: true, testUser });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro ao criar usuário de teste";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(_req: NextRequest) {
  try {
    const jar = await cookies();
    const current = jar.get("meli_token");
    const refreshToken = current ? JSON.parse(current.value)?.refresh_token : undefined;
    
    if (!refreshToken) {
      return NextResponse.json({ ok: false, error: "Sem refresh_token" }, { status: 400 });
    }

    const body = new URLSearchParams();
    body.set("grant_type", "refresh_token");
    body.set("client_id", process.env.MELI_CLIENT_ID!);
    body.set("client_secret", process.env.MELI_CLIENT_SECRET!);
    body.set("refresh_token", refreshToken);

    const res = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ ok: false, error: txt }, { status: res.status });
    }
    
    const token = await res.json();
    const out = NextResponse.json({ ok: true, new_token: token });
    
    out.cookies.set("meli_token", JSON.stringify(token), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: true,
      maxAge: 60 * 60 * 24, // 1 dia
    });
    
    return out;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro ao atualizar token";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


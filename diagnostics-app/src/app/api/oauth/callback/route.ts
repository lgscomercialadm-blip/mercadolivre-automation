import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function exchangeToken(params: URLSearchParams, codeVerifier?: string) {
  const clientId = process.env.MELI_CLIENT_ID!.trim();
  const clientSecret = process.env.MELI_CLIENT_SECRET!.trim();
  const redirectUri = process.env.MELI_REDIRECT_URI!.trim();
  
  // Debug: log para verificar se as variáveis estão sendo lidas
  console.log('Client ID:', clientId);
  console.log('Client Secret length:', clientSecret?.length);
  console.log('Redirect URI:', redirectUri);

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("code", params.get("code") || "");
  body.set("redirect_uri", redirectUri);
  if (codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao trocar token: ${res.status} ${text}`);
  }
  return res.json();
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const jar = await cookies();
  const expectedState = jar.get("meli_oauth_state")?.value;
  const receivedState = url.searchParams.get("state") || undefined;

  if (error) {
    return NextResponse.json({ ok: false, step: "auth", error });
  }
  if (!code) {
    return NextResponse.json({ ok: false, step: "callback", error: "Código ausente", state_expected: expectedState, state_received: receivedState });
  }
  if (expectedState && receivedState && expectedState !== receivedState) {
    return NextResponse.json({ ok: false, step: "state", error: "State inválido", state_expected: expectedState, state_received: receivedState });
  }

  try {
    const codeVerifier = jar.get("meli_code_verifier")?.value;
    const token = await exchangeToken(url.searchParams, codeVerifier);
    // armazenar em cookie de sessão simples (posteriormente Supabase)
    const res = NextResponse.json({ ok: true, user_id: token?.user_id, scope: token?.scope });
    res.cookies.set("meli_token", JSON.stringify(token), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: true,
      maxAge: 60 * 60 * 24, // 1 dia
    });
    // limpar cookies temporários
    res.cookies.delete("meli_oauth_state");
    res.cookies.delete("meli_code_verifier");
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro na troca de token";
    return NextResponse.json({ ok: false, step: "exchange", error: message, code, state: receivedState });
  }
}



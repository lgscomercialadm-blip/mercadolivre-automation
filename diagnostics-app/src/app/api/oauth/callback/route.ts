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
  const receivedState = url.searchParams.get("state") || undefined;

  if (error) {
    return NextResponse.json({ ok: false, step: "auth", error });
  }
  if (!code) {
    return NextResponse.json({ ok: false, step: "callback", error: "Código ausente" });
  }
  if (!receivedState) {
    return NextResponse.json({ ok: false, step: "callback", error: "State ausente" });
  }

  try {
    // SOLUÇÃO ROBUSTA: Extrair code_verifier do state (estratégia primária)
    let codeVerifier: string | undefined;
    
    try {
      // Tentar decodificar o state que contém o verifier
      const stateDecoded = Buffer.from(receivedState, "base64url").toString("utf-8");
      const stateData = JSON.parse(stateDecoded);
      codeVerifier = stateData.verifier;
      
      // Validar timestamp (não aceitar states com mais de 15 minutos)
      const age = Date.now() - stateData.timestamp;
      if (age > 900000) { // 15 minutos
        return NextResponse.json({ 
          ok: false, 
          step: "state", 
          error: "State expirado. Tente fazer login novamente." 
        });
      }
    } catch (decodeError) {
      // Se falhar ao decodificar, tentar pegar do cookie (backup)
      codeVerifier = jar.get("meli_code_verifier")?.value;
    }
    
    // Verificar se conseguimos o code_verifier de alguma fonte
    if (!codeVerifier) {
      return NextResponse.json({ 
        ok: false, 
        step: "verifier", 
        error: "code_verifier não encontrado. Tente fazer login novamente.",
        debug: {
          state_received: !!receivedState,
          cookie_verifier: !!jar.get("meli_code_verifier"),
          cookie_state: !!jar.get("meli_oauth_state")
        }
      });
    }
    
    const token = await exchangeToken(url.searchParams, codeVerifier);
    
    // Armazenar em cookie de sessão
    const res = NextResponse.json({ ok: true, user_id: token?.user_id, scope: token?.scope });
    res.cookies.set("meli_token", JSON.stringify(token), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias (token do ML expira em 6h mas temos refresh)
    });
    
    // Limpar cookies temporários
    res.cookies.delete("meli_oauth_state");
    res.cookies.delete("meli_code_verifier");
    
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro na troca de token";
    return NextResponse.json({ ok: false, step: "exchange", error: message, code });
  }
}



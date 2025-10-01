import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Env variável ausente: ${name}`);
  }
  return value.trim();
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const clientId = getEnv("MELI_CLIENT_ID");
  const redirectUri = getEnv("MELI_REDIRECT_URI");

  // PKCE: gerar code_verifier e challenge S256
  const random = crypto.getRandomValues(new Uint8Array(32));
  const codeVerifier = Buffer.from(random).toString("base64url");
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = Buffer.from(new Uint8Array(digest)).toString("base64url");

  // SOLUÇÃO ROBUSTA: Empacotar state + code_verifier em um único valor Base64
  // Isso garante que o code_verifier viaje com o state e não se perca
  const stateData = {
    uuid: crypto.randomUUID(),
    verifier: codeVerifier,
    timestamp: Date.now()
  };
  const stateEncoded = Buffer.from(JSON.stringify(stateData)).toString("base64url");

  // Persistir TAMBÉM em cookies como backup (estratégia dupla)
  const jar = await cookies();
  jar.set("meli_oauth_state", stateEncoded, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 900 });
  jar.set("meli_code_verifier", codeVerifier, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 900 });

  const authUrl = new URL("https://auth.mercadolivre.com/authorization");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", stateEncoded); // State agora contém o verifier
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authUrl.toString());
}



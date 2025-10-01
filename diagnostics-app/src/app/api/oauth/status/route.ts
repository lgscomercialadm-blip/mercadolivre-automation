import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const jar = await cookies();
  
  // Verificar variáveis de ambiente
  const hasClientId = !!process.env.MELI_CLIENT_ID;
  const hasClientSecret = !!process.env.MELI_CLIENT_SECRET;
  const hasRedirectUri = !!process.env.MELI_REDIRECT_URI;
  
  // Verificar cookies
  const hasTokenCookie = !!jar.get("meli_token");
  const hasStateCookie = !!jar.get("meli_oauth_state");
  const hasVerifierCookie = !!jar.get("meli_code_verifier");
  
  // Tentar ler token
  let tokenData = null;
  try {
    const tokenCookie = jar.get("meli_token");
    if (tokenCookie) {
      tokenData = JSON.parse(tokenCookie.value);
    }
  } catch {
    // Ignorar erro de parse
  }
  
  return NextResponse.json({
    environment: {
      hasClientId,
      hasClientSecret,
      hasRedirectUri,
      redirectUri: hasRedirectUri ? process.env.MELI_REDIRECT_URI : null,
    },
    cookies: {
      hasTokenCookie,
      hasStateCookie,
      hasVerifierCookie,
    },
    session: {
      isAuthenticated: !!tokenData,
      userId: tokenData?.user_id,
      hasAccessToken: !!tokenData?.access_token,
      hasRefreshToken: !!tokenData?.refresh_token,
    },
    instructions: {
      login: "https://diagnostics-app-topaz.vercel.app/api/oauth/login",
      status: "https://diagnostics-app-topaz.vercel.app/api/oauth/status",
    }
  });
}


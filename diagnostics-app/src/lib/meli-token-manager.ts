import { cookies } from "next/headers";

export interface MeliToken {
  access_token: string;
  refresh_token: string;
  user_id: number;
  expires_in: number;
  token_issued_at?: number; // timestamp quando o token foi emitido
}

/**
 * Verifica se o token está expirado ou prestes a expirar (margem de 5 minutos)
 */
export function isTokenExpired(token: MeliToken): boolean {
  if (!token.token_issued_at) {
    // Se não temos quando foi emitido, considera expirado para forçar renovação
    return true;
  }

  const now = Date.now();
  const expiresAt = token.token_issued_at + (token.expires_in * 1000);
  const marginMs = 5 * 60 * 1000; // 5 minutos de margem

  return now >= (expiresAt - marginMs);
}

/**
 * Renova o token automaticamente usando o refresh_token
 */
export async function refreshMeliToken(refreshToken: string): Promise<MeliToken> {
  const CLIENT_ID = process.env.MELI_CLIENT_ID!;
  const CLIENT_SECRET = process.env.MELI_CLIENT_SECRET!;

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("❌ Erro ao renovar token:", res.status, errorData);
    throw new Error(`Falha ao renovar token: ${res.status}`);
  }

  const data = await res.json();

  const newToken: MeliToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user_id: data.user_id,
    expires_in: data.expires_in,
    token_issued_at: Date.now(),
  };

  return newToken;
}

/**
 * Obtém o token válido, renovando automaticamente se necessário
 */
export async function getValidToken(): Promise<MeliToken | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("meli_token");

  if (!tokenCookie?.value) {
    console.log("⚠️ Nenhum token encontrado");
    return null;
  }

  let token: MeliToken;
  try {
    token = JSON.parse(tokenCookie.value);
  } catch {
    console.error("❌ Token inválido no cookie");
    return null;
  }

  // ✅ Verifica se o token está expirado
  if (isTokenExpired(token)) {
    console.log("🔄 Token expirado, renovando automaticamente...");
    
    try {
      const newToken = await refreshMeliToken(token.refresh_token);
      
      // Salva o novo token no cookie
      cookieStore.set("meli_token", JSON.stringify(newToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: "/",
      });

      console.log("✅ Token renovado automaticamente!");
      return newToken;
    } catch (error) {
      console.error("❌ Falha ao renovar token automaticamente:", error);
      return null;
    }
  }

  return token;
}

/**
 * Salva o token no cookie
 */
export async function saveToken(token: MeliToken): Promise<void> {
  const cookieStore = await cookies();
  
  const tokenWithTimestamp: MeliToken = {
    ...token,
    token_issued_at: Date.now(),
  };

  cookieStore.set("meli_token", JSON.stringify(tokenWithTimestamp), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: "/",
  });
}


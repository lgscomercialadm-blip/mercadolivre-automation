"use client";

import { useEffect, useState } from "react";

type OAuthStatus = {
  environment: {
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasRedirectUri: boolean;
    redirectUri: string | null;
  };
  cookies: {
    hasTokenCookie: boolean;
    hasStateCookie: boolean;
    hasVerifierCookie: boolean;
  };
  session: {
    isAuthenticated: boolean;
    userId?: number;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
  };
  instructions: {
    login: string;
    status: string;
  };
};

export default function Home() {
  const [status, setStatus] = useState<OAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const loginUrl = "/api/oauth/login";

  useEffect(() => {
    fetch("/api/oauth/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-2xl w-full space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Diagnóstico Mercado Livre</h1>
          <p className="text-gray-600">Conecte sua conta para coletarmos os dados da conta e anúncios.</p>
          
          {status?.session.isAuthenticated ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 font-semibold">✅ Autenticado com sucesso!</p>
                <p className="text-sm text-green-700 mt-1">User ID: {status.session.userId}</p>
              </div>
              <a
                href="/diagnostics"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition"
              >
                Ver Diagnóstico Completo
              </a>
            </div>
          ) : (
            <a
              href={loginUrl}
              className="inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 hover:bg-gray-800 transition"
            >
              🔐 Conectar Mercado Livre
            </a>
          )}
        </div>

        {!loading && status && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">🔍 Status do Sistema</h2>
            
            <div className="space-y-4">
              {/* Variáveis de Ambiente */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Variáveis de Ambiente:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{status.environment.hasClientId ? "✅" : "❌"}</span>
                    <span>MELI_CLIENT_ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{status.environment.hasClientSecret ? "✅" : "❌"}</span>
                    <span>MELI_CLIENT_SECRET</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{status.environment.hasRedirectUri ? "✅" : "❌"}</span>
                    <span>MELI_REDIRECT_URI</span>
                  </div>
                  {status.environment.redirectUri && (
                    <div className="text-xs text-gray-500 mt-1 pl-6">
                      URL: {status.environment.redirectUri}
                    </div>
                  )}
                </div>
              </div>

              {/* Cookies */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Cookies:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{status.cookies.hasTokenCookie ? "✅" : "⚪"}</span>
                    <span>Token de Sessão</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{status.cookies.hasStateCookie ? "🔄" : "⚪"}</span>
                    <span>OAuth State (temporário)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{status.cookies.hasVerifierCookie ? "🔄" : "⚪"}</span>
                    <span>Code Verifier (temporário)</span>
                  </div>
                </div>
              </div>

              {/* Sessão */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Sessão:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{status.session.isAuthenticated ? "✅" : "❌"}</span>
                    <span>Autenticado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{status.session.hasAccessToken ? "✅" : "❌"}</span>
                    <span>Access Token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{status.session.hasRefreshToken ? "✅" : "❌"}</span>
                    <span>Refresh Token</span>
                  </div>
                </div>
              </div>
            </div>

            {!status.environment.hasClientId && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm font-semibold">⚠️ Variáveis de ambiente não configuradas!</p>
                <p className="text-red-700 text-xs mt-1">Configure as variáveis no Vercel antes de continuar.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

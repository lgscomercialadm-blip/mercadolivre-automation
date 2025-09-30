"use client";

import { useEffect, useState } from "react";

type Token = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user_id?: number;
};

export default function Dashboard() {
  const [token, setToken] = useState<Token | null>(null);

  useEffect(() => {
    // Em MVP, lemos cookie simples via API interna
    fetch("/api/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setToken(data?.token ?? null))
      .catch(() => setToken(null));
  }, []);

  return (
    <main className="min-h-screen p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {!token && (
        <div className="text-sm text-gray-600">
          Sem sessão. Volte e clique em &quot;Conectar Mercado Livre&quot;.
        </div>
      )}
      {token && (
        <pre className="bg-gray-100 p-3 rounded border overflow-auto">
{JSON.stringify({ user_id: token.user_id, has_token: !!token.access_token }, null, 2)}
        </pre>
      )}
    </main>
  );
}



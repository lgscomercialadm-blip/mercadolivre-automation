"use client";

import { useState } from "react";

export default function TestUsersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const createTestUser = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/meli/create-test-user", {
        method: "POST",
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Criar Usuários de Teste - Mercado Livre</h1>
      
      <button 
        onClick={createTestUser} 
        disabled={loading}
        style={{
          padding: "1rem 2rem",
          fontSize: "1rem",
          backgroundColor: "#3483fa",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Criando..." : "Criar Usuário de Teste"}
      </button>

      {result && (
        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: result.ok ? "#d4edda" : "#f8d7da",
          border: `1px solid ${result.ok ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: "6px",
        }}>
          <h3>{result.ok ? "✅ Sucesso!" : "❌ Erro"}</h3>
          <pre style={{ 
            whiteSpace: "pre-wrap", 
            wordBreak: "break-all",
            fontSize: "0.9rem",
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

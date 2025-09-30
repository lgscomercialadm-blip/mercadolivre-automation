"use client";

import { useState, useEffect } from "react";

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<Record<string, unknown> | null>(null);
  const [ads, setAds] = useState<Record<string, unknown> | null>(null);
  const [sales, setSales] = useState<Record<string, unknown> | null>(null);

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      // Buscar informações da conta
      const accountRes = await fetch("/api/meli/account-info");
      const accountData = await accountRes.json();
      setAccountInfo(accountData);

      // Buscar anúncios
      const adsRes = await fetch("/api/meli/ads");
      const adsData = await adsRes.json();
      setAds(adsData);

      // Buscar vendas
      const salesRes = await fetch("/api/meli/sales");
      const salesData = await salesRes.json();
      setSales(salesData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>📊 Diagnóstico Completo - Mercado Livre</h1>
      
      {loading && <p>Carregando diagnósticos...</p>}

      {/* Informações da Conta */}
      {accountInfo && (
        <section style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h2>👤 Informações da Conta</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
            {JSON.stringify(accountInfo, null, 2)}
          </pre>
        </section>
      )}

      {/* Anúncios */}
      {ads && (
        <section style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h2>📦 Anúncios</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
            {JSON.stringify(ads, null, 2)}
          </pre>
        </section>
      )}

      {/* Vendas */}
      {sales && (
        <section style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h2>💰 Vendas (Últimos 30 dias)</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
            {JSON.stringify(sales, null, 2)}
          </pre>
        </section>
      )}

      <button 
        onClick={loadDiagnostics}
        style={{
          marginTop: "2rem",
          padding: "1rem 2rem",
          fontSize: "1rem",
          backgroundColor: "#3483fa",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        🔄 Recarregar Diagnósticos
      </button>
    </div>
  );
}

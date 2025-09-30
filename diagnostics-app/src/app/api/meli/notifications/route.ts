import { NextRequest, NextResponse } from "next/server";

// Placeholder de webhook para notificações do Mercado Livre
// Posteriormente vamos validar assinatura/segurança e persistir no banco

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as unknown;
    console.log("[meli:notification]", JSON.stringify(payload));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  // Alguns testes de webhook usam GET; respondemos 200 para verificação simples
  return NextResponse.json({ ok: true });
}



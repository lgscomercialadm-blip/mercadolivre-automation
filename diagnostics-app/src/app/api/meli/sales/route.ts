import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const jar = await cookies();
    const tokenCookie = jar.get("meli_token");
    
    if (!tokenCookie) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const token = JSON.parse(tokenCookie.value);
    const accessToken = token.access_token;
    const userId = token.user_id;

    // Data de 30 dias atrás
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFrom = thirtyDaysAgo.toISOString();

    // Buscar pedidos dos últimos 30 dias
    const ordersRes = await fetch(
      `https://api.mercadolibre.com/orders/search?seller=${userId}&order.date_created.from=${dateFrom}&limit=50`,
      {
        headers: { "Authorization": `Bearer ${accessToken}` },
      }
    );

    if (!ordersRes.ok) {
      const text = await ordersRes.text();
      return NextResponse.json({ 
        ok: false, 
        error: `Falha ao buscar vendas: ${ordersRes.status} ${text}` 
      }, { status: ordersRes.status });
    }

    const ordersData = await ordersRes.json();
    const orders = ordersData.results || [];

    // Análise das vendas
    const salesByItem: Record<string, { title: string; quantity: number; revenue: number }> = {};
    let totalRevenue = 0;

    for (const order of orders) {
      for (const item of order.order_items || []) {
        const itemId = item.item.id;
        const title = item.item.title;
        const quantity = item.quantity || 0;
        const price = item.unit_price || 0;
        const revenue = quantity * price;

        if (!salesByItem[itemId]) {
          salesByItem[itemId] = { title, quantity: 0, revenue: 0 };
        }

        salesByItem[itemId].quantity += quantity;
        salesByItem[itemId].revenue += revenue;
        totalRevenue += revenue;
      }
    }

    // Ordenar por mais vendidos
    const topSellers = Object.entries(salesByItem)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return NextResponse.json({ 
      ok: true, 
      total_orders: orders.length,
      total_revenue: totalRevenue,
      top_sellers: topSellers,
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro ao buscar vendas";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

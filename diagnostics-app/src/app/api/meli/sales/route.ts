import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Sales Analytics API - Baseado na lógica da biblioteca
 * Calcula vendas REAIS do período (não o histórico total)
 */

interface OrderItem {
  item: {
    id: string;
    title: string;
  };
  quantity: number;
  unit_price: number;
}

interface Payment {
  payment_method_id: string;
  total_paid_amount: number;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  date_created: string;
  order_items: OrderItem[];
  payments: Payment[];
}

interface SalesMetrics {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  status_distribution: Record<string, number>;
  payment_methods: Record<string, number>;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const jar = await cookies();
    const tokenCookie = jar.get("meli_token");
    
    if (!tokenCookie) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const token = JSON.parse(tokenCookie.value);
    const accessToken = token.access_token;
    const userId = String(token.user_id); // Converter para string

    // Parâmetros de data (padrão: 30 dias)
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get('days') || '30';
    const days = parseInt(daysParam);

    // Calcular date_from e date_to (período completo)
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    const dateFromISO = dateFrom.toISOString();
    const dateToISO = dateTo.toISOString();

    // Buscar TODOS os pedidos do período (CORRETO: com date_from E date_to)
    const ordersRes = await fetch(
      `https://api.mercadolibre.com/orders/search?seller=${userId}&order.date_created.from=${dateFromISO}&order.date_created.to=${dateToISO}&limit=200`,
      {
        headers: { "Authorization": `Bearer ${accessToken}` },
        cache: "no-store",
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
    const orders: Order[] = ordersData.results || [];

    // Calcular métricas (baseado na biblioteca)
    const metrics = calculateOrderMetrics(orders);

    // Análise de vendas por produto (CORRETO: usando total_amount do pedido)
    const salesByItem: Record<string, { title: string; quantity: number; revenue: number }> = {};

    for (const order of orders) {
      // Total do pedido (pode ter múltiplos itens)
      const orderTotal = parseFloat(order.total_amount?.toString() || '0');
      const orderItems = order.order_items || [];
      
      // Se o pedido tem múltiplos itens, dividir proporcionalmente
      const totalItemsValue = orderItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);
      
      for (const item of orderItems) {
        const itemId = item.item.id;
        const title = item.item.title;
        const quantity = item.quantity || 0;
        
        // Calcular revenue proporcional ao total do pedido
        // (isso considera descontos, frete, etc)
        const itemValue = item.quantity * item.unit_price;
        const revenue = totalItemsValue > 0 
          ? (itemValue / totalItemsValue) * orderTotal 
          : itemValue;

        if (!salesByItem[itemId]) {
          salesByItem[itemId] = { title, quantity: 0, revenue: 0 };
        }

        salesByItem[itemId].quantity += quantity;
        salesByItem[itemId].revenue += revenue;
      }
    }

    // Top 20 produtos mais vendidos
    const topSellers = Object.entries(salesByItem)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 20);

    // Produtos SEM vendas (precisamos buscar todos os anúncios para comparar)
    const zeroSalesProducts = await getZeroSalesProducts(accessToken, userId, salesByItem);

    return NextResponse.json({ 
      ok: true,
      period_days: days,
      date_from: dateFromISO,
      date_to: dateToISO,
      metrics,
      top_sellers: topSellers,
      zero_sales_products: zeroSalesProducts,
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro ao buscar vendas";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * Calcula métricas dos pedidos - BASEADO NA BIBLIOTECA
 */
function calculateOrderMetrics(orders: Order[]): SalesMetrics {
  if (!orders || orders.length === 0) {
    return {
      total_orders: 0,
      total_revenue: 0,
      avg_order_value: 0,
      status_distribution: {},
      payment_methods: {},
    };
  }

  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.total_amount?.toString() || '0'),
    0
  );

  const avgOrderValue = totalRevenue / orders.length;

  // Distribuição por status
  const statusDist: Record<string, number> = {};
  const paymentMethods: Record<string, number> = {};

  for (const order of orders) {
    const status = order.status || 'unknown';
    statusDist[status] = (statusDist[status] || 0) + 1;

    // Método de pagamento
    const payments = order.payments || [];
    for (const payment of payments) {
      const method = payment.payment_method_id || 'unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    }
  }

  return {
    total_orders: orders.length,
    total_revenue: totalRevenue,
    avg_order_value: avgOrderValue,
    status_distribution: statusDist,
    payment_methods: paymentMethods,
  };
}

/**
 * Identifica produtos sem vendas no período
 */
async function getZeroSalesProducts(
  accessToken: string,
  userId: string,
  salesByItem: Record<string, unknown>
): Promise<Array<{id: string; title: string; days_without_sales: number}>> {
  try {
    // Buscar TODOS os anúncios ativos
    const itemsRes = await fetch(
      `https://api.mercadolibre.com/users/${userId}/items/search?status=active&limit=200`,
      {
        headers: { "Authorization": `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    if (!itemsRes.ok) return [];

    const itemsData = await itemsRes.json();
    const allItemIds: string[] = itemsData.results || [];

    // Produtos que NÃO estão nas vendas
    const zeroSales = allItemIds
      .filter(itemId => !salesByItem[itemId])
      .slice(0, 20); // Top 20 parados

    // Buscar detalhes básicos
    const zeroSalesDetails = await Promise.all(
      zeroSales.map(async (itemId) => {
        const itemRes = await fetch(
          `https://api.mercadolibre.com/items/${itemId}`,
          { cache: "no-store" }
        );
        if (!itemRes.ok) return null;
        const item = await itemRes.json();
        return {
          id: item.id,
          title: item.title,
          days_without_sales: 60, // TODO: calcular baseado em última venda
        };
      })
    );

    return zeroSalesDetails.filter(item => item !== null) as Array<{id: string; title: string; days_without_sales: number}>;

  } catch (e) {
    console.error("Erro ao buscar produtos parados:", e);
    return [];
  }
}

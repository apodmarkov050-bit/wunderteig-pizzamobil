import { NextResponse } from 'next/server';
import { demoRestaurants } from '../../../../app/demoOrders';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_ZONE = 'Europe/Berlin';
const STATUS_LABELS = {
  pending: 'Wartet auf Antwort',
  proposed: 'Zeit vorgeschlagen',
  accepted: 'Vom Kunden bestätigt',
  change_requested: 'Neue Zeit angefragt',
  completed: 'Abgeschlossen',
};

function datePartsInBerlin(date) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(({ type, value }) => [type, value]));
}

function berlinMidnightUtc(year, month, day) {
  const target = Date.UTC(year, month - 1, day);
  let timestamp = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = datePartsInBerlin(new Date(timestamp));
    const observed = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour));
    const difference = target - observed;
    if (!difference) break;
    timestamp += difference;
  }
  return new Date(timestamp);
}

function periodBounds(period, now) {
  if (period === 'all') return null;
  const today = datePartsInBerlin(now);
  const days = period === '7days' ? 7 : period === '30days' ? 30 : 1;
  return {
    start: berlinMidnightUtc(Number(today.year), Number(today.month), Number(today.day) - (days - 1)),
    end: berlinMidnightUtc(Number(today.year), Number(today.month), Number(today.day) + 1),
  };
}

function bucketKey(date, period) {
  const parts = datePartsInBerlin(date);
  if (period === 'today') return `${parts.hour}:00`;
  if (period === 'all') return `${parts.year}-${parts.month}`;
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function bucketLabel(key, period) {
  if (period === 'today') return key;
  const date = period === 'all'
    ? new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1)
    : new Date(`${key}T12:00:00`);
  return new Intl.DateTimeFormat('de-DE', period === 'all'
    ? { month: 'short', year: '2-digit' }
    : { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit' }).format(date);
}

export async function GET(request) {
  const expectedCode = process.env.RESTAURANT_DEMO_ACCESS_CODE;
  const receivedCode = request.headers.get('x-restaurant-access-code');
  if (!expectedCode || !receivedCode || receivedCode !== expectedCode) {
    return NextResponse.json({ error: 'Restaurant-Zugangscode fehlt oder ist falsch.' }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const restaurantId = params.get('restaurantId');
  const requestedPeriod = params.get('period');
  const period = ['today', '7days', '30days', 'all'].includes(requestedPeriod) ? requestedPeriod : '7days';
  if (!demoRestaurants.some((item) => item.id === restaurantId)) {
    return NextResponse.json({ error: 'Restaurant nicht gefunden.' }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase ist noch nicht vollständig eingerichtet.' }, { status: 503 });

  try {
    const bounds = periodBounds(period, new Date());
    let query = supabase.from('platform_demo_orders')
      .select('order_data, status, created_at')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    if (bounds) query = query.gte('created_at', bounds.start.toISOString()).lt('created_at', bounds.end.toISOString());

    const { data, error } = await query;
    if (error) throw error;
    const rows = data || [];
    const statuses = Object.entries(STATUS_LABELS).map(([key, label]) => ({
      key, label, count: rows.filter((row) => row.status === key).length,
    }));
    const products = new Map();
    const trend = new Map();
    let estimatedOrderValue = 0;

    for (const row of rows) {
      const order = row.order_data || {};
      const orderValue = Number(order.total || 0) + (order.kind === 'delivery' ? Number(order.restaurant?.deliveryFee || 0) : 0);
      estimatedOrderValue += orderValue;
      const key = bucketKey(new Date(row.created_at), period);
      trend.set(key, (trend.get(key) || 0) + orderValue);
      for (const item of order.items || []) {
        const name = String(item.name || 'Unbenannter Artikel');
        products.set(name, (products.get(name) || 0) + Number(item.quantity || 0));
      }
    }

    return NextResponse.json({
      period,
      metrics: {
        orderCount: rows.length,
        awaitingResponse: rows.filter((row) => ['pending', 'change_requested'].includes(row.status)).length,
        acceptedCount: rows.filter((row) => row.status === 'accepted').length,
        completedCount: rows.filter((row) => row.status === 'completed').length,
        estimatedOrderValue,
        averageOrderValue: rows.length ? estimatedOrderValue / rows.length : 0,
      },
      statuses,
      topItems: [...products.entries()]
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, 'de'))
        .slice(0, 8),
      trend: [...trend.entries()]
        .map(([key, value]) => ({ key, label: bucketLabel(key, period), orderValue: value }))
        .sort((a, b) => a.key.localeCompare(b.key)),
    });
  } catch (error) {
    console.error('Platform statistics query failed:', error.message);
    return NextResponse.json({ error: 'Statistik konnte nicht geladen werden.' }, { status: 500 });
  }
}

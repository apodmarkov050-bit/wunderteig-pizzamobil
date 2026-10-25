import { NextResponse } from 'next/server';
import { demoRestaurants } from '../../../../app/demoOrders';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonError(error, status) {
  return NextResponse.json({ error }, { status });
}

function hasRestaurantAccess(request) {
  const expected = process.env.RESTAURANT_DEMO_ACCESS_CODE;
  const received = request.headers.get('x-restaurant-access-code');
  return Boolean(expected && received && received === expected);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError('Supabase ist noch nicht vollständig eingerichtet.', 503);

  try {
    const { order } = await request.json();
    const restaurant = demoRestaurants.find((item) => item.id === order?.restaurant?.id);
    if (!restaurant || !UUID_PATTERN.test(order?.id || '') || !order?.number || !order?.customerName?.trim() || !order?.customerPhone?.trim()) {
      return jsonError('Bitte überprüfe die Bestelldaten.', 400);
    }
    if (!Array.isArray(order.items) || !order.items.length || order.items.length > 30) {
      return jsonError('Die Bestellung enthält keine gültigen Artikel.', 400);
    }
    if (!order.items.every((item) => Number.isInteger(item.quantity) && item.quantity > 0 && Number.isFinite(item.price) && item.price >= 0)) {
      return jsonError('Ungültige Bestellpositionen.', 400);
    }

    const cleanOrder = {
      id: order.id,
      number: order.number,
      restaurant,
      customerName: String(order.customerName).trim().slice(0, 120),
      customerPhone: String(order.customerPhone).trim().slice(0, 40),
      total: Number(order.total),
      kind: order.kind === 'delivery' ? 'delivery' : 'pickup',
      requestedTime: String(order.requestedTime || 'ASAP').slice(0, 80),
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: order.items.map((item) => ({
        id: String(item.id).slice(0, 100),
        category: String(item.category || '').slice(0, 80),
        name: String(item.name || '').slice(0, 120),
        desc: String(item.desc || '').slice(0, 300),
        price: Number(item.price),
        emoji: String(item.emoji || '').slice(0, 12),
        quantity: item.quantity,
      })),
    };
    if (!Number.isFinite(cleanOrder.total) || cleanOrder.total < 0) return jsonError('Ungültiger Bestellbetrag.', 400);

    const { error } = await supabase.from('platform_demo_orders').insert({
      id: cleanOrder.id,
      order_number: cleanOrder.number,
      restaurant_id: restaurant.id,
      status: cleanOrder.status,
      order_data: cleanOrder,
    });
    if (error) {
      console.error('Platform demo order insert failed:', error.message);
      return jsonError('Die Bestellung konnte nicht gespeichert werden. Bitte versuche es erneut.', 500);
    }
    return NextResponse.json({ order: cleanOrder }, { status: 201 });
  } catch (error) {
    console.error('Platform demo order request failed:', error);
    return jsonError('Die Bestellung konnte nicht gespeichert werden.', 500);
  }
}

export async function GET(request) {
  if (!hasRestaurantAccess(request)) return jsonError('Restaurant-Zugangscode fehlt oder ist falsch.', 401);
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError('Supabase ist noch nicht vollständig eingerichtet.', 503);

  const restaurantId = new URL(request.url).searchParams.get('restaurantId');
  if (!demoRestaurants.some((item) => item.id === restaurantId)) return jsonError('Restaurant nicht gefunden.', 404);

  const { data, error } = await supabase
    .from('platform_demo_orders')
    .select('order_data, status, created_at')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Platform demo order list failed:', error.message);
    return jsonError('Bestellungen konnten nicht geladen werden.', 500);
  }
  const orders = (data || []).map((row) => ({
    ...row.order_data,
    status: row.status,
    createdAt: row.created_at,
  }));
  return NextResponse.json({ orders });
}

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabaseAdmin';

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

export async function GET(_request, context) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError('Supabase ist noch nicht vollständig eingerichtet.', 503);
  const { id } = await context.params;
  const { data, error } = await supabase
    .from('platform_demo_orders')
    .select('order_data, status, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('Platform demo order lookup failed:', error.message);
    return jsonError('Bestellstatus konnte nicht geladen werden.', 500);
  }
  if (!data) return jsonError('Bestellung nicht gefunden.', 404);
  return NextResponse.json({ order: { ...data.order_data, status: data.status, createdAt: data.created_at } });
}

export async function PATCH(request, context) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError('Supabase ist noch nicht vollständig eingerichtet.', 503);

  try {
    const { id } = await context.params;
    const { changes } = await request.json();
    const { data: current, error: readError } = await supabase
      .from('platform_demo_orders')
      .select('order_data, status')
      .eq('id', id)
      .maybeSingle();
    if (readError) return jsonError('Bestellung konnte nicht geladen werden.', 500);
    if (!current) return jsonError('Bestellung nicht gefunden.', 404);

    const isRestaurant = hasRestaurantAccess(request);
    const allowedCustomerStatuses = ['accepted', 'change_requested'];
    if (isRestaurant) {
      if (!['pending', 'change_requested'].includes(current.status) || changes?.status !== 'proposed') {
        return jsonError('Für diese Bestellung kann keine Zeit mehr vorgeschlagen werden.', 409);
      }
      const prepMinutes = Number(changes.prepMinutes);
      if (!Number.isInteger(prepMinutes) || prepMinutes < 5 || prepMinutes > 180 || !/^\d{2}:\d{2}$/.test(changes.confirmedTime || '')) {
        return jsonError('Ungültiger Zeitvorschlag.', 400);
      }
    } else if (!allowedCustomerStatuses.includes(changes?.status) || current.status !== 'proposed') {
      return jsonError('Diese Rückmeldung passt nicht zum aktuellen Bestellstatus.', 409);
    }

    const nextData = {
      ...current.order_data,
      ...changes,
      proposedAt: isRestaurant ? new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : current.order_data.proposedAt,
      ...(changes.status === 'accepted' ? { customerAcceptedAt: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) } : {}),
      ...(changes.status === 'change_requested' ? { customerAcceptedAt: undefined } : {}),
    };
    const { data, error } = await supabase
      .from('platform_demo_orders')
      .update({ status: changes.status, order_data: nextData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('order_data, status, created_at')
      .single();
    if (error) {
      console.error('Platform demo order update failed:', error.message);
      return jsonError('Bestellung konnte nicht aktualisiert werden.', 500);
    }
    return NextResponse.json({ order: { ...data.order_data, status: data.status, createdAt: data.created_at } });
  } catch (error) {
    console.error('Platform demo order update request failed:', error);
    return jsonError('Bestellung konnte nicht aktualisiert werden.', 500);
  }
}

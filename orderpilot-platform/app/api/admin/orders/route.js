
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';
import { getAdminUser } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Serverbestellungen sind nicht konfiguriert.' }, { status: 503 });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          line_total
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin orders fetch error:', error);
      return NextResponse.json(
        { error: 'Bestellungen konnten nicht geladen werden.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: orders ?? [] });
  } catch (error) {
    console.error('Admin orders API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
export async function PATCH(request) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Serverbestellungen sind nicht konfiguriert.' }, { status: 503 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (body.agreedTime !== undefined || body.communicationChannel !== undefined) {
      const { agreedTime, communicationChannel } = body;
      if (!id || !['whatsapp', 'telegram'].includes(communicationChannel) ||
          (agreedTime !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(agreedTime))) {
        return NextResponse.json({ error: 'Ungültige Bestätigungsdaten.' }, { status: 400 });
      }
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ agreed_time: agreedTime || null, communication_channel: communicationChannel })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Admin order confirmation update error:', error);
        return NextResponse.json({ error: 'Bestätigungsdaten konnten nicht gespeichert werden.' }, { status: 500 });
      }
      return NextResponse.json({ order: data });
    }

    const allowedStatuses = [
      'new',
      'accepted',
      'preparing',
      'ready',
      'completed',
      'cancelled',
    ];

    if (!id || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Ungültige Bestellnummer oder Status.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Admin order status update error:', error);
      return NextResponse.json(
        { error: 'Status konnte nicht gespeichert werden.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error('Admin order PATCH error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}

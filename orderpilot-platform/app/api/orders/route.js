
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      customer,
      items,
      subtotal,
      deliveryFee,
      total,
      communicationChannel,
    } = body;

    if (
      !customer ||
      !customer.name?.trim() ||
      !customer.phone?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Bitte überprüfe die Bestelldaten.' },
        { status: 400 }
      );
    }

    if (!['whatsapp', 'telegram'].includes(communicationChannel)) {
      return NextResponse.json({ error: 'Ungültiger Kontaktkanal.' }, { status: 400 });
    }
    if (!['abholung', 'pickup', 'lieferung'].includes(customer.pickupType)) {
      return NextResponse.json({ error: 'Ungültige Bestellart.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Serverbestellungen sind in dieser Demo nicht aktiviert.' },
        { status: 503 }
      );
    }

    if (
      items.some(
        (item) =>
          !item.name ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          !Number.isFinite(item.price) ||
          item.price < 0
      )
    ) {
      return NextResponse.json(
        { error: 'Ungültige Bestellpositionen.' },
        { status: 400 }
      );
    }

    const orderNumber = `OP-${Date.now()}`;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        pickup_type: customer.pickupType,
        requested_time: customer.time?.trim() || null,
        communication_channel: communicationChannel,
        delivery_note: customer.pickupType === 'lieferung' ? customer.deliveryNote?.trim() || null : null,
        street: customer.pickupType === 'lieferung' ? customer.street?.trim() || null : null,
        house_number: customer.pickupType === 'lieferung' ? customer.houseNumber?.trim() || null : null,
        postal_code: customer.pickupType === 'lieferung' ? customer.postalCode?.trim() || null : null,
        city: customer.pickupType === 'lieferung' ? customer.city?.trim() || null : null,
        floor: customer.pickupType === 'lieferung' ? customer.floor?.trim() || null : null,
        status: 'new',
        subtotal,
        delivery_fee: deliveryFee,
        total,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return NextResponse.json(
        { error: 'Die Bestellung konnte nicht gespeichert werden.' },
        { status: 500 }
      );
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      line_total: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items insert error:', itemsError);

      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', order.id);

      return NextResponse.json(
        { error: 'Die Bestellpositionen konnten nicht gespeichert werden.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order API error:', error);

    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}

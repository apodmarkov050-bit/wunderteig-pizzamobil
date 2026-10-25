
import { getSupabaseAdmin } from '../../lib/supabaseAdmin';
import { requireAdminPage } from '../../lib/adminAuth';
import OrderStatusSelect from './OrderStatusSelect';
import OrderConfirmationComposer from './OrderConfirmationComposer';
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdminPage();
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) throw new Error('The legacy admin backend is not configured.');
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

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f4f7f5',
        padding: '40px 24px',
        color: '#17231b',
        fontFamily: 'Arial, sans-serif',
      }}
    >
     <div style={{
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '240px minmax(0, 1fr)',
  gap: '32px',
  alignItems: 'start'
}}>
    <aside style={{
  background: '#ffffff',
  border: '1px solid #e0e9e2',
  borderRadius: '16px',
  padding: '20px',
  position: 'sticky',
  top: '24px'
}}>
  <h2 style={{ fontSize: '18px', margin: '0 0 20px' }}>
    OrderPilot
  </h2>

  <nav style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  }}>
    <a href="/admin" style={{
      display: 'block',
      padding: '12px',
      borderRadius: '8px',
      background: '#128447',
      color: '#ffffff',
      textDecoration: 'none',
      fontWeight: 700
    }}>
      📋 Bestellungen
    </a>

    <a href="/admin/stats" style={{
      display: 'block',
      padding: '12px',
      borderRadius: '8px',
      background: '#e1f2e7',
      color: '#128447',
      textDecoration: 'none',
      fontWeight: 700
    }}>
      📊 Statistik
    </a>
  </nav>
  <form action="/api/admin/logout" method="post" style={{ marginTop: '16px' }}>
    <button type="submit" style={{
      width: '100%',
      padding: '12px',
      border: '1px solid #dce8df',
      borderRadius: '8px',
      background: '#ffffff',
      color: '#17231b',
      fontWeight: 700,
      textAlign: 'left'
    }}>
      Abmelden
    </button>
  </form>
</aside>
<div>
        <a
          href="/"
          style={{
            color: '#128447',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          ← OrderPilot
        </a>

       
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
  <div>
    <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
      Bestellverwaltung
    </h1>
    <p style={{ color: '#66736a', margin: 0 }}>
      Übersicht aller gespeicherten Bestellungen
    </p>
  </div>

  <a
    href="/admin/stats"
    style={{
      display: 'inline-block',
      background: '#128447',
      color: '#ffffff',
      padding: '12px 20px',
      borderRadius: '10px',
      textDecoration: 'none',
      fontWeight: 700
    }}
  >
    📊 Statistik
  </a>
</div>
        {error ? (
          <p style={{ color: '#b42318' }}>
            Fehler beim Laden der Bestellungen: {error.message}
          </p>
        ) : !orders?.length ? (
          <p>Noch keine Bestellungen vorhanden.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: '#ffffff',
                borderRadius: '12px',
              }}
            >
              <thead>
                <tr style={{ background: '#e1f2e7', textAlign: 'left' }}>
                  {['Bestellung', 'Bestellte Artikel', 'Kunde', 'Telefon', 'Abholung/Lieferung', 'Summe', 'Status', 'Kundenbestätigung'].map(
                    (heading) => (
                      <th
                        key={heading}
                        style={{ padding: '16px', borderBottom: '1px solid #d5e2d9' }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ padding: '16px', borderBottom: '1px solid #e5eae6' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid #e5eae6', minWidth: '220px' }}>
                      {order.order_items?.length ? (
                        <ul style={{ margin: 0, paddingLeft: '18px' }}>
                          {order.order_items.map((item) => (
                            <li key={item.id} style={{ marginBottom: '6px' }}>
                              <strong>{item.quantity} × {item.product_name}</strong>
                              <span style={{ display: 'block', color: '#66736a', fontSize: '13px' }}>
                                {Number(item.line_total ?? item.unit_price * item.quantity).toFixed(2)} €
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: '#66736a' }}>Keine Artikelpositionen gespeichert</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid #e5eae6' }}>
                      {order.customer_name}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid #e5eae6', whiteSpace: 'nowrap' }}>
                      {order.customer_phone}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid #e5eae6' }}>
                      {order.pickup_type}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid #e5eae6', whiteSpace: 'nowrap' }}>
                      {Number(order.total).toFixed(2)} €
                    </td>
                    
<td style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
  <OrderStatusSelect
    orderId={order.id}
    initialStatus={order.status}
  />
</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5eae6', minWidth: '310px', verticalAlign: 'top' }}>
                      <OrderConfirmationComposer order={order} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}

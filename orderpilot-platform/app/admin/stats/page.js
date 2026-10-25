import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { requireAdminPage } from '../../../lib/adminAuth';
import StatsPeriodFilter from './StatsPeriodFilter';

export const dynamic = 'force-dynamic';

const TIME_ZONE = 'Europe/Berlin';
const PAGE_SIZE = 1000;

function datePartsInBerlin(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function berlinMidnightUtc(year, month, day) {
  // Iteratively map local midnight to UTC, accounting for CET/CEST changes.
  const target = Date.UTC(year, month - 1, day);
  let timestamp = target;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = datePartsInBerlin(new Date(timestamp));
    const observed = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    const difference = target - observed;
    if (difference === 0) break;
    timestamp += difference;
  }

  return new Date(timestamp);
}

function getPeriodBounds(period, now) {
  if (period === 'all') return null;

  const today = datePartsInBerlin(now);
  const end = berlinMidnightUtc(
    Number(today.year),
    Number(today.month),
    Number(today.day) + 1
  );
  const days = period === '7days' ? 7 : period === '30days' ? 30 : 1;
  const start = berlinMidnightUtc(
    Number(today.year),
    Number(today.month),
    Number(today.day) - (days - 1)
  );

  return { start, end };
}

async function fetchAllOrders() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) throw new Error('The legacy admin backend is not configured.');
  const orders = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_phone,
        pickup_type,
        street,
        house_number,
        postal_code,
        city,
        floor,
        total,
        status,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          line_total
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    orders.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return orders;
  }
}

function formatEuro(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function getBucketKey(date, period) {
  const parts = datePartsInBerlin(date);
  if (period === 'today') return `${parts.hour}:00`;
  if (period === 'all') return `${parts.year}-${parts.month}`;
  return `${parts.day}.${parts.month}`;
}

function formatBucketLabel(key, period) {
  if (period === 'today') return key;
  if (period === 'all') {
    const [year, month] = key.split('-');
    return new Intl.DateTimeFormat('de-DE', { month: 'short', year: '2-digit' })
      .format(new Date(Number(year), Number(month) - 1, 1));
  }
  return key;
}

function formatOrderDate(value) {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: TIME_ZONE,
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getOrderAddress(order) {
  const street = [order.street, order.house_number].filter(Boolean).join(' ');
  const locality = [order.postal_code, order.city].filter(Boolean).join(' ');
  const address = [street, locality].filter(Boolean).join(', ');
  const floor = order.floor?.trim();
  return [address, floor].filter(Boolean).join(' · ');
}

function getAddressKey(order) {
  return [order.street, order.house_number, order.postal_code, order.city, order.floor]
    .map((part) => String(part ?? '')
      .normalize('NFKC')
      .toLocaleLowerCase('de-DE')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim())
    .join('|');
}

export default async function StatsPage({ searchParams }) {
  await requireAdminPage();
  const params = await searchParams;
  const requestedPeriod = params?.period;
  const period = ['today', '7days', '30days', 'all'].includes(requestedPeriod)
    ? requestedPeriod
    : 'today';

  let allOrders;
  try {
    allOrders = await fetchAllOrders();
  } catch (error) {
    console.error('Admin statistics fetch error:', error);
    return (
      <main className="statsPage">
        <div className="statsContainer">
          <a className="statsBackLink" href="/admin">← Zurück zur Bestellverwaltung</a>
          <form action="/api/admin/logout" method="post" className="statsLogoutForm">
            <button className="statsLogoutButton" type="submit">Abmelden</button>
          </form>
          <h1>Statistik</h1>
          <p className="statsError" role="alert">
            Die Bestellungen konnten nicht geladen werden. Bitte lade die Seite erneut.
          </p>
        </div>
      </main>
    );
  }

  const now = new Date();
  const bounds = getPeriodBounds(period, now);
  const ordersInPeriod = allOrders.filter((order) => {
    if (!bounds) return true;
    const createdAt = new Date(order.created_at);
    return createdAt >= bounds.start && createdAt < bounds.end;
  });
  const completedOrders = ordersInPeriod.filter((order) => order.status === 'completed');
  const cancelledOrders = ordersInPeriod.filter((order) => order.status === 'cancelled');
  const revenue = completedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const averageOrder = completedOrders.length ? revenue / completedOrders.length : 0;
  const assortment = new Map();

  for (const order of completedOrders) {
    for (const item of order.order_items ?? []) {
      const name = item.product_name?.trim() || 'Unbenannter Artikel';
      const current = assortment.get(name) ?? { name, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.line_total ?? Number(item.unit_price || 0) * Number(item.quantity || 0));
      assortment.set(name, current);
    }
  }

  const assortmentRows = [...assortment.values()].sort(
    (first, second) => second.quantity - first.quantity || second.revenue - first.revenue
  );

  const bucketKeys = [];
  if (period === 'today') {
    bucketKeys.push(...Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`));
  } else if (period === 'all') {
    const byMonth = new Map();
    for (const order of completedOrders) {
      const key = getBucketKey(new Date(order.created_at), period);
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(order.total || 0));
    }
    bucketKeys.push(...[...byMonth.keys()].sort().slice(-12));
    if (!bucketKeys.length) bucketKeys.push(getBucketKey(now, period));
  } else {
    for (let dayOffset = period === '7days' ? 6 : 29; dayOffset >= 0; dayOffset -= 1) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      bucketKeys.push(getBucketKey(date, period));
    }
  }
  const revenueByBucket = new Map(bucketKeys.map((key) => [key, 0]));
  for (const order of completedOrders) {
    const key = getBucketKey(new Date(order.created_at), period);
    if (revenueByBucket.has(key)) {
      revenueByBucket.set(key, revenueByBucket.get(key) + Number(order.total || 0));
    }
  }
  const chartRows = bucketKeys.map((key) => ({
    key,
    label: formatBucketLabel(key, period),
    revenue: revenueByBucket.get(key) ?? 0,
  }));
  const chartMax = Math.max(...chartRows.map((row) => row.revenue), 1);
  const statuses = [
    { key: 'new', label: 'Neu' },
    { key: 'accepted', label: 'Angenommen' },
    { key: 'preparing', label: 'In Zubereitung' },
    { key: 'ready', label: 'Bereit' },
    { key: 'completed', label: 'Abgeschlossen' },
    { key: 'cancelled', label: 'Storniert' },
  ].map((status) => ({
    ...status,
    count: ordersInPeriod.filter((order) => order.status === status.key).length,
  }));
  const totalOrders = ordersInPeriod.length;
  const addressHistory = new Map();
  let deliveriesWithoutAddress = 0;
  for (const order of allOrders) {
    if (order.pickup_type !== 'lieferung') continue;
    const address = getOrderAddress(order);
    const key = getAddressKey(order);
    if (!address || !key.replaceAll('|', '').trim()) {
      deliveriesWithoutAddress += 1;
      continue;
    }
    const group = addressHistory.get(key) ?? { address, orders: [] };
    group.orders.push(order);
    addressHistory.set(key, group);
  }
  const addressHistoryRows = [...addressHistory.values()].sort(
    (first, second) => second.orders.length - first.orders.length
      || first.address.localeCompare(second.address, 'de')
  );
  const orderStatusLabels = {
    new: 'Neu',
    accepted: 'Angenommen',
    preparing: 'In Zubereitung',
    ready: 'Bereit',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
  };

  const periodLabels = {
    today: 'heute',
    '7days': 'in den letzten 7 Tagen',
    '30days': 'in den letzten 30 Tagen',
    all: 'insgesamt',
  };
  const cards = [
    { title: `Umsatz ${periodLabels[period]}`, value: formatEuro(revenue) },
    { title: 'Abgeschlossene Bestellungen', value: completedOrders.length },
    { title: 'Durchschnittlicher Bestellwert', value: formatEuro(averageOrder) },
    { title: 'Stornierte Bestellungen', value: cancelledOrders.length },
  ];

  return (
    <main className="statsPage">
      <div className="statsContainer">
        <a className="statsBackLink" href="/admin">← Zurück zur Bestellverwaltung</a>
        <form action="/api/admin/logout" method="post" className="statsLogoutForm">
          <button className="statsLogoutButton" type="submit">Abmelden</button>
        </form>
        <h1>Statistik</h1>
        <p className="statsIntro">Übersicht deiner Restaurantbestellungen</p>

        <StatsPeriodFilter value={period} />

        <div className="statsGrid">
          {cards.map((card) => (
            <section className="statsCard" key={card.title}>
              <p>{card.title}</p>
              <strong>{card.value}</strong>
            </section>
          ))}
        </div>

        <div className="statsInsightsGrid">
          <section className="statsPanel statsRevenuePanel" aria-labelledby="revenue-chart-heading">
            <div className="statsPanelHeading">
              <div>
                <h2 id="revenue-chart-heading">Umsatzentwicklung</h2>
                <p>Tagesumsatz aus abgeschlossenen Bestellungen</p>
              </div>
              <strong>{formatEuro(revenue)}</strong>
            </div>
            <div className={`revenueChart ${chartRows.length > 7 ? 'isDense' : ''}`} style={{ gridTemplateColumns: `repeat(${chartRows.length}, minmax(0, 1fr))` }} role="img" aria-label={`Umsatz je Zeitraumabschnitt: ${chartRows.map((row) => `${row.label}: ${formatEuro(row.revenue)}`).join('; ')}`}>
              {chartRows.map((row) => (
                <div className="revenueChartColumn" key={row.key} title={`${row.label}: ${formatEuro(row.revenue)}`}>
                  <span className="revenueChartValue">{row.revenue > 0 ? formatEuro(row.revenue) : ''}</span>
                  <div className="revenueChartTrack">
                    <span className="revenueChartBar" style={{ height: `${Math.max(row.revenue > 0 ? 8 : 0, (row.revenue / chartMax) * 100)}%` }} />
                  </div>
                  <span className="revenueChartLabel">{row.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="statsPanel statsStatusPanel" aria-labelledby="status-heading">
            <div className="statsPanelHeading">
              <div>
                <h2 id="status-heading">Bestellstatus</h2>
                <p>Verteilung im ausgewählten Zeitraum</p>
              </div>
              <strong>{totalOrders}</strong>
            </div>
            {totalOrders ? (
              <div className="statusList">
                {statuses.filter((status) => status.count > 0).map((status) => (
                  <div className="statusRow" key={status.key}>
                    <span className={`statusDot statusDot-${status.key}`} aria-hidden="true" />
                    <span>{status.label}</span>
                    <div className="statusTrack" aria-hidden="true"><span style={{ width: `${(status.count / totalOrders) * 100}%` }} /></div>
                    <strong>{status.count}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="statsPanelEmpty">In diesem Zeitraum gibt es noch keine Bestellungen.</p>
            )}
          </section>
        </div>

        <section className="assortmentSection customerOrdersSection" aria-labelledby="customer-orders-heading">
          <div className="assortmentHeading">
            <div>
              <h2 id="customer-orders-heading">Kunden und Bestellungen</h2>
              <p>Kontaktdaten und Lieferadresse aus den Bestellungen im ausgewählten Zeitraum</p>
            </div>
            <span>{ordersInPeriod.length} Bestellungen</span>
          </div>

          {ordersInPeriod.length ? (
            <div className="assortmentTableWrap">
              <table className="assortmentTable customerOrdersTable">
                <thead>
                  <tr>
                    <th>Bestellung</th>
                    <th>Kunde</th>
                    <th>Telefon</th>
                    <th>Lieferadresse</th>
                    <th>Status</th>
                    <th>Summe</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersInPeriod.map((order) => {
                    const address = getOrderAddress(order);
                    return (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.order_number || `#${order.id}`}</strong>
                          <span className="customerOrderDate">{formatOrderDate(order.created_at)}</span>
                        </td>
                        <td>{order.customer_name || '—'}</td>
                        <td>{order.customer_phone ? <a className="customerPhoneLink" href={`tel:${order.customer_phone}`}>{order.customer_phone}</a> : '—'}</td>
                        <td>
                          {order.pickup_type === 'lieferung'
                            ? address || <span className="customerDataMissing">Adresse nicht gespeichert</span>
                            : 'Abholung'}
                        </td>
                        <td>{orderStatusLabels[order.status] || order.status || '—'}</td>
                        <td>{formatEuro(Number(order.total || 0))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="assortmentEmpty">Für diesen Zeitraum gibt es noch keine Bestellungen.</p>
          )}
          <p className="customerDataNote">Die Angaben stammen jeweils aus der Bestellung. Frühere Bestellungen werden hier nicht automatisch zu Kunden zusammengeführt.</p>
        </section>

        <section className="assortmentSection addressHistorySection" aria-labelledby="address-history-heading">
          <div className="assortmentHeading">
            <div>
              <h2 id="address-history-heading">Lieferadressen-Verlauf</h2>
              <p>Alle gespeicherten Lieferaufträge, nach Adresse gruppiert</p>
            </div>
            <span>{addressHistoryRows.length} Adressen</span>
          </div>

          {addressHistoryRows.length ? (
            <div className="addressHistoryList">
              {addressHistoryRows.map((group) => (
                <details className="addressHistoryGroup" key={getAddressKey(group.orders[0])}>
                  <summary>
                    <span className="addressHistoryAddress">{group.address}</span>
                    <span className="addressHistoryCount">{group.orders.length} {group.orders.length === 1 ? 'Bestellung' : 'Bestellungen'}</span>
                  </summary>
                  <div className="assortmentTableWrap">
                    <table className="assortmentTable addressHistoryTable">
                      <thead>
                        <tr>
                          <th>Bestellung</th>
                          <th>Kunde</th>
                          <th>Telefon</th>
                          <th>Status</th>
                          <th>Summe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.orders.map((order) => (
                          <tr key={order.id}>
                            <td><strong>{order.order_number || `#${order.id}`}</strong><span className="customerOrderDate">{formatOrderDate(order.created_at)}</span></td>
                            <td>{order.customer_name || '—'}</td>
                            <td>{order.customer_phone || '—'}</td>
                            <td>{orderStatusLabels[order.status] || order.status || '—'}</td>
                            <td>{formatEuro(Number(order.total || 0))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <p className="assortmentEmpty">Es gibt noch keine gespeicherten Lieferadressen.</p>
          )}
          {deliveriesWithoutAddress > 0 && (
            <p className="customerDataNote">Bei {deliveriesWithoutAddress} Lieferbestellungen wurde keine Adresse gespeichert. Diese Bestellungen können deshalb keiner Adresshistorie zugeordnet werden.</p>
          )}
          <p className="customerDataNote">Eine gemeinsame Lieferadresse verbindet hier nur die Bestellhistorie. Sie ordnet Bestellungen nicht automatisch derselben Person zu.</p>
        </section>

        <section className="assortmentSection" aria-labelledby="assortment-heading">
          <div className="assortmentHeading">
            <div>
              <h2 id="assortment-heading">Verkaufte Artikel</h2>
              <p>Sortiment im ausgewählten Zeitraum, nur aus abgeschlossenen Bestellungen</p>
            </div>
            <span>{assortmentRows.length} Artikel</span>
          </div>

          {assortmentRows.length ? (
            <div className="assortmentTableWrap">
              <table className="assortmentTable">
                <thead>
                  <tr>
                    <th>Artikel</th>
                    <th>Verkaufte Menge</th>
                    <th>Umsatz</th>
                  </tr>
                </thead>
                <tbody>
                  {assortmentRows.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatEuro(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="assortmentEmpty">Für diesen Zeitraum gibt es noch keine abgeschlossenen Bestellungen mit Artikelpositionen.</p>
          )}
        </section>

        <p className="statsNote">
          Der Umsatz und der durchschnittliche Bestellwert berücksichtigen nur abgeschlossene Bestellungen.
          Die Zeiträume verwenden den Kalender in Berlin.
        </p>
      </div>
    </main>
  );
}

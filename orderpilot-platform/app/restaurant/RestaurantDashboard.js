'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { demoRestaurants } from '../demoOrders';
import { ordersRepository } from '../ordersRepository';

const euro = (value) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
const statusLabel = (status) => ({ pending: 'Wartet auf Antwort', proposed: 'Zeit vorgeschlagen', accepted: 'Vom Kunden bestätigt', change_requested: 'Neue Zeit angefragt' })[status] || status;

export default function RestaurantDashboard({ restaurantSlug }) {
  const restaurantId = restaurantSlug;
  const [orders, setOrders] = useState([]);
  const [minutes, setMinutes] = useState({});
  const [notice, setNotice] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [connected, setConnected] = useState(false);
  const pollTimer = useRef(null);
  const restaurant = demoRestaurants.find((item) => item.id === restaurantId);

  useEffect(() => {
    let cancelled = false;
    async function refresh(code) {
      try {
        const nextOrders = await ordersRepository.list(restaurantId, code);
        if (!cancelled) {
          setOrders(nextOrders);
          setConnected(true);
          setAccessError('');
        }
        return true;
      } catch (error) {
        if (!cancelled) {
          setConnected(false);
          setAccessError(error.message);
        }
        return false;
      }
    }
    function startPolling(code) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = window.setInterval(() => refresh(code), 5000);
    }
    const savedCode = window.sessionStorage.getItem('orderpilot-restaurant-access-code') || '';
    if (savedCode) {
      setAccessCode(savedCode);
      refresh(savedCode).then((authorized) => {
        if (!cancelled && authorized) startPolling(savedCode);
      });
    }
    return () => { cancelled = true; window.clearInterval(pollTimer.current); };
  }, [restaurantId]);

  const restaurantOrders = useMemo(() => orders.filter((order) => order.restaurant.id === restaurantId), [orders, restaurantId]);
  const pendingCount = restaurantOrders.filter((order) => ['pending', 'change_requested'].includes(order.status)).length;
  const visibleNotice = restaurantOrders.some((order) => order.status === 'proposed' && notice.includes(order.number)) ? notice : '';

  async function connectRestaurant(event) {
    event.preventDefault();
    const code = accessCode.trim();
    if (!code) { setAccessError('Bitte gib den Restaurant-Zugangscode ein.'); return; }
    try {
      const nextOrders = await ordersRepository.list(restaurantId, code);
      window.sessionStorage.setItem('orderpilot-restaurant-access-code', code);
      setOrders(nextOrders);
      setAccessCode(code);
      setConnected(true);
      setAccessError('');
      window.clearInterval(pollTimer.current);
      pollTimer.current = window.setInterval(async () => {
        try { setOrders(await ordersRepository.list(restaurantId, code)); }
        catch (error) { setConnected(false); setAccessError(error.message); window.clearInterval(pollTimer.current); }
      }, 5000);
    } catch (error) {
      setConnected(false);
      setAccessError(error.message);
    }
  }

  async function proposeTime(order) {
    const prepMinutes = Math.max(5, Number(minutes[order.id] || 35));
    const now = new Date();
    const ready = new Date(now.getTime() + prepMinutes * 60_000);
    const confirmedAt = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const confirmedTime = ready.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const receiveText = order.kind === 'delivery' ? 'bei dir geliefert' : 'zur Abholung bereit';
    const restaurantReply = `Hallo ${order.customerName}! Danke für deine Bestellung 😊 Wir können dir eine Fertigstellung in ${prepMinutes} Minuten anbieten: ${confirmedTime} Uhr ${receiveText}. Passt dir diese Zeit?`;
    try {
      await ordersRepository.update(order.id, { status: 'proposed', proposedAt: confirmedAt, confirmedTime, prepMinutes, restaurantReply }, accessCode);
      setNotice(`Zeitvorschlag für ${order.number} gesendet. Der Kunde kann ihn jetzt bestätigen oder um eine andere Zeit bitten.`);
      setOrders(await ordersRepository.list(restaurantId, accessCode));
    } catch (error) { setAccessError(error.message); }
  }

  if (!restaurant) return <main className="platformPage"><div className="platformContent restaurantDashboard"><a className="backLink" href="/restaurant">← Alle Restaurant-Konten</a><h1>Restaurant nicht gefunden.</h1><p>Dieser Demo-Zugang ist nicht eingerichtet.</p></div></main>;

  if (!connected) return <main className="platformPage"><header className="platformNav"><a className="brand" href="/"><span className="brandMark">O</span><span>OrderPilot<span className="brandLight">Platform</span></span></a><div className="navRight"><span className="demoPill"><i /> RESTAURANT-DEMO</span></div></header><div className="platformContent restaurantDashboard"><div className="dashboardTop"><div><span className="eyebrow">RESTAURANT-BEREICH · DEMO</span><h1>Bestellungen.</h1><p>Gib den Zugangscode ein, um Bestellungen für {restaurant.name} zu sehen.</p></div></div><form className="checkoutCard" onSubmit={connectRestaurant} style={{ maxWidth: 520 }}><label className="fieldLabel">Restaurant-Zugangscode<input autoComplete="current-password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="Zugangscode" /></label>{accessError && <p className="formNotice">{accessError}</p>}<button className="primaryButton" type="submit">Kabinettszugang öffnen →</button></form></div></main>;

  return <main className="platformPage">
    <header className="platformNav"><a className="brand" href="/"><span className="brandMark">O</span><span>OrderPilot<span className="brandLight">Platform</span></span></a><div className="navRight"><span className="demoPill"><i /> {restaurant.name.toUpperCase()} · DEMO-KONTO</span><a className="restaurantNavLink" href={`/restaurant/${restaurant.id}/stats`}>Statistik ↗</a><a className="restaurantNavLink" href={`/?restaurant=${restaurant.id}`}>Kundenansicht ↗</a></div></header>
    <div className="platformContent restaurantDashboard">
      <div className="dashboardTop"><div><a className="backLink" href="/restaurant">← Alle Demo-Konten</a><span className="eyebrow">RESTAURANT-BEREICH · DEMO</span><h1>Bestellungen.</h1><p>Aufträge für {restaurant.name}. Prüfe neue Anfragen und bestätige die voraussichtliche Zeit.</p></div><div className="dashboardAccount"><span>RESTAURANT-KONTO</span><strong>{restaurant.name}</strong><small>Demo-Zugang · {restaurant.id}</small></div></div>
      <div className="dashboardStats"><div><span>Benötigen deine Antwort</span><strong>{pendingCount}</strong></div><div><span>Bestellungen gesamt</span><strong>{restaurantOrders.length}</strong></div><div><span>Restaurant</span><strong className="dashboardRestaurantName">{restaurant.name}</strong></div></div>
      {visibleNotice && <div className="dashboardNotice">✓ &nbsp; {visibleNotice}</div>}
      <div className="dashboardSectionHeading"><div><h2>Eingegangene Bestellungen</h2><p>Bestellungen werden über Supabase zwischen Geräten synchronisiert.</p></div><span className="dashboardDemoTag">DEMO-DATEN</span></div>
      {restaurantOrders.length === 0 ? <div className="dashboardEmpty"><div>▤</div><h3>Noch keine Bestellungen</h3><p>Öffne die Kundenansicht in einem zweiten Tab, wähle {restaurant.name} und gib eine Demo-Bestellung auf.</p><a className="primaryButton" href={`/?restaurant=${restaurant.id}`}>Kundenmenü öffnen ↗</a></div> : <div className="dashboardOrders">{restaurantOrders.map((order) => <article className="dashboardOrder" key={order.id}><div className="dashboardOrderHeader"><div><span className="dashboardOrderNumber">{order.number}</span><h3>{order.customerName}</h3></div><span className={`orderStatus ${order.status === 'accepted' ? 'isAccepted' : order.status === 'proposed' ? 'isProposed' : ''}`}>{statusLabel(order.status)}</span></div><div className="dashboardOrderMeta"><span>◷ Anfrage {new Date(order.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span><span>{order.kind === 'delivery' ? '🚲 Lieferung' : '🏃 Selbstabholung'}</span><span>Wunsch: {order.requestedTime}</span><span>☎ {order.customerPhone}</span></div><div className="dashboardItems">{order.items.map((item) => <div key={item.id}><span>{item.quantity} × {item.name}</span><b>{euro(item.price * item.quantity)}</b></div>)}</div><div className="dashboardOrderTotal"><span>Gesamt {order.kind === 'delivery' ? `(inkl. ${euro(order.restaurant.deliveryFee)} Liefergebühr)` : '(Abholung)'}</span><strong>{euro(order.total + (order.kind === 'delivery' ? order.restaurant.deliveryFee : 0))}</strong></div>{['pending', 'change_requested'].includes(order.status) ? <div className="dashboardConfirm"><label className="fieldLabel">{order.status === 'change_requested' ? 'Neue Zubereitungszeit' : 'Voraussichtliche Zubereitungszeit'}<select value={minutes[order.id] || '35'} onChange={(event) => setMinutes((current) => ({ ...current, [order.id]: event.target.value }))}><option value="20">20 Minuten</option><option value="25">25 Minuten</option><option value="30">30 Minuten</option><option value="35">35 Minuten</option><option value="45">45 Minuten</option><option value="60">60 Minuten</option></select></label><button className="primaryButton" onClick={() => proposeTime(order)}>{order.status === 'change_requested' ? 'Neue Zeit vorschlagen →' : 'Zeit vorschlagen →'}</button></div> : order.status === 'proposed' ? <div className="acceptedReply proposedReply"><span>◷ Zeitvorschlag gesendet um {order.proposedAt}</span><strong>Vorgeschlagen: {order.confirmedTime} Uhr · {order.prepMinutes} Min.</strong><p>{order.restaurantReply}</p><small>Wartet auf die Rückmeldung des Kunden.</small></div> : <div className="acceptedReply"><span>✓ Kunde hat bestätigt um {order.customerAcceptedAt}</span><strong>Fertig um {order.confirmedTime} · {order.prepMinutes} Min.</strong><p>{order.restaurantReply}</p></div>}</article>)}</div>}
      <p className="dashboardPrivacy">Demo-Bestellungen werden in der Supabase-Testdatenbank gespeichert. Bitte keine echten Bestellungen oder Kundendaten verwenden.</p>
    </div>
    <footer className="platformFooter"><a className="brand" href="/"><span className="brandMark">O</span><span>OrderPilot<span className="brandLight">Platform</span></span></a><span>Restaurant-Demo · {restaurant.name}</span><a href="/restaurant">Alle Demo-Konten ↗</a></footer>
  </main>;
}

'use client';

import { useEffect, useState } from 'react';
import { demoRestaurants } from '../../../demoOrders';

const periods = [['today', 'Heute'], ['7days', '7 Tage'], ['30days', '30 Tage'], ['all', 'Gesamter Zeitraum']];
const statusNames = {
  pending: 'Wartet auf Antwort',
  proposed: 'Zeit vorgeschlagen',
  accepted: 'Vom Kunden bestätigt',
  change_requested: 'Änderungswunsch eingegangen',
  completed: 'Abgeschlossen',
};
const euro = (value) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value || 0);

async function getStats(restaurantId, period, code) {
  const query = new URLSearchParams({ restaurantId, period });
  const response = await fetch(`/api/platform/stats?${query}`, {
    headers: { 'x-restaurant-access-code': code },
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Die Statistik konnte nicht geladen werden.');
  return result;
}

export default function RestaurantStats({ restaurantSlug }) {
  const restaurant = demoRestaurants.find((item) => item.id === restaurantSlug);
  const [codeInput, setCodeInput] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [period, setPeriod] = useState('7days');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem('orderpilot-restaurant-access-code') || '';
    if (saved) { setCodeInput(saved); setAccessCode(saved); }
  }, []);

  useEffect(() => {
    if (!accessCode || !restaurant) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    getStats(restaurant.id, period, accessCode)
      .then((result) => { if (!cancelled) setStats(result); })
      .catch((cause) => { if (!cancelled) { setStats(null); setError(cause.message); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [accessCode, period, restaurant]);

  async function connect(event) {
    event.preventDefault();
    const code = codeInput.trim();
  if (!code) { setError('Bitte gib den Restaurant-Zugangscode ein.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await getStats(restaurant.id, period, code);
      window.sessionStorage.setItem('orderpilot-restaurant-access-code', code);
      setStats(result);
      setAccessCode(code);
    } catch (cause) {
      setStats(null);
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  if (!restaurant) return <main className="platformPage"><div className="platformContent"><h1>Ресторан не найден.</h1></div></main>;
  const maxTrend = Math.max(1, ...(stats?.trend || []).map((item) => item.orderValue));

  return <main className="platformPage">
    <header className="platformNav">
      <a className="brand" href="/"><span className="brandMark">O</span><span>OrderPilot<span className="brandLight">Platform</span></span></a>
      <div className="navRight"><a className="restaurantNavLink" href={`/restaurant/${restaurant.id}`}>← Bestellungen</a><a className="restaurantNavLink" href={`/?restaurant=${restaurant.id}`}>Kundenansicht ↗</a></div>
    </header>
    <div className="platformContent restaurantDashboard restaurantStatsPage">
      <a className="backLink" href={`/restaurant/${restaurant.id}`}>← Zur Bestellübersicht</a>
      <div className="dashboardTop"><div><span className="eyebrow">STATISTIK · DEMO</span><h1>{restaurant.name}</h1><p>Übersicht der Bestellungen dieses Restaurants.</p></div></div>

      {!accessCode && <form className="checkoutCard restaurantStatsAccess" onSubmit={connect}>
        <label className="fieldLabel">Restaurant-Zugangscode<input autoComplete="current-password" value={codeInput} onChange={(event) => setCodeInput(event.target.value)} placeholder="Zugangscode" /></label>
        {error && <p className="formNotice">{error}</p>}
        <button className="primaryButton" type="submit" disabled={loading}>{loading ? 'Verbinde…' : 'Statistik öffnen →'}</button>
      </form>}

      {accessCode && <>
        <div className="restaurantStatsToolbar"><div className="restaurantStatsPeriods" aria-label="Statistikzeitraum">{periods.map(([key, label]) => <button type="button" key={key} className={period === key ? 'isActive' : ''} onClick={() => setPeriod(key)}>{label}</button>)}</div><button type="button" className="restaurantStatsReconnect" onClick={() => { window.sessionStorage.removeItem('orderpilot-restaurant-access-code'); setCodeInput(''); setAccessCode(''); setStats(null); }}>Code ändern</button></div>
        {error && <p className="formNotice" role="alert">{error}</p>}
        {loading && !stats && <p className="restaurantStatsMessage">Daten werden geladen…</p>}
        {stats && <>
          <div className="restaurantStatsCards">
            <article><span>Bestellungen im Zeitraum</span><strong>{stats.metrics.orderCount}</strong></article>
            <article><span>Warten auf Antwort</span><strong>{stats.metrics.awaitingResponse}</strong></article>
            <article><span>Vom Kunden bestätigt</span><strong>{stats.metrics.acceptedCount}</strong></article>
            <article><span>Abgeschlossene Bestellungen</span><strong>{stats.metrics.completedCount}</strong></article>
            <article><span>Geschätzter Bestellwert</span><strong>{euro(stats.metrics.estimatedOrderValue)}</strong></article>
          </div>
          <p className="restaurantStatsNote">Der Betrag ist eine Schätzung des Bestellvolumens und kein tatsächlicher Umsatz, da Zahlungen über die Plattform noch nicht aktiviert sind. Durchschnittlicher Bestellwert: <strong>{euro(stats.metrics.averageOrderValue)}</strong>.</p>
          <div className="restaurantStatsPanels">
            <section className="restaurantStatsPanel"><h2>Bestellwert im Zeitverlauf</h2>{stats.trend.length ? <div className="restaurantStatsChart">{stats.trend.map((item) => <div className="restaurantStatsBar" key={item.key} title={`${item.label}: ${euro(item.orderValue)}`}><strong>{item.orderValue ? euro(item.orderValue) : ''}</strong><i style={{ height: `${Math.max(item.orderValue ? 8 : 0, item.orderValue / maxTrend * 100)}%` }} /><span>{item.label}</span></div>)}</div> : <p>Keine Bestellungen in diesem Zeitraum.</p>}</section>
            <section className="restaurantStatsPanel"><h2>Bestellstatus</h2><ul className="restaurantStatsStatusList">{stats.statuses.map((item) => <li key={item.key}><span><i className={`status-${item.key}`} />{statusNames[item.key] || item.label}</span><strong>{item.count}</strong></li>)}</ul></section>
            <section className="restaurantStatsPanel restaurantStatsTopItems"><h2>Beliebte Artikel</h2>{stats.topItems.length ? <ol>{stats.topItems.map((item) => <li key={item.name}><span>{item.name}</span><strong>{item.quantity} Stk.</strong></li>)}</ol> : <p>Keine Artikel in diesem Zeitraum.</p>}</section>
          </div>
        </>}
      </>}
      <p className="dashboardPrivacy">Angezeigt werden nur Demo-Bestellungen von {restaurant.name}. Bitte keine echten Kundendaten verwenden.</p>
    </div>
  </main>;
}

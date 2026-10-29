'use client';

import { useEffect, useMemo, useState } from 'react';
import { demoRestaurants } from './demoOrders';
import { ordersRepository } from './ordersRepository';
const menus = {
  wunderteig: [
  { id: 'margherita', category: 'Pizza', name: 'Margherita', desc: 'San-Marzano-Tomaten, Fior di latte, Basilikum', price: 9.5, emoji: '🍕' },
  { id: 'salame', category: 'Pizza', name: 'Salame', desc: 'Tomatensauce, Mozzarella, würzige Salami', price: 11.5, emoji: '🍕' },
  { id: 'diavola', category: 'Pizza', name: 'Diavola', desc: 'Scharfe Salami, Chili, Mozzarella', price: 12.5, emoji: '🌶️' },
  { id: 'carbonara', category: 'Pasta', name: 'Carbonara', desc: 'Guanciale, Eigelb, Pecorino, schwarzer Pfeffer', price: 13.5, emoji: '🍝' },
  { id: 'burrata', category: 'Vorspeisen', name: 'Burrata & Tomate', desc: 'Burrata, bunte Tomaten, Basilikumöl', price: 10.5, emoji: '🍅' },
  { id: 'tiramisu', category: 'Dessert', name: 'Tiramisu', desc: 'Hausgemacht mit Espresso und Kakao', price: 6.5, emoji: '🍰' },
  ],
  'green-table': [
    { id: 'green-goddess', category: 'Bowls', name: 'Green Goddess Bowl', desc: 'Quinoa, Avocado, Edamame, Kräuterdressing', price: 13.9, emoji: '🥑' },
    { id: 'crispy-tofu', category: 'Bowls', name: 'Crispy Tofu Bowl', desc: 'Knuspriger Tofu, Jasminreis, Sesam', price: 12.9, emoji: '🥗' },
    { id: 'falafel', category: 'Bowls', name: 'Falafel & Hummus', desc: 'Falafel, Hummus, frisches Fladenbrot', price: 11.5, emoji: '🧆' },
    { id: 'soup', category: 'Extras', name: 'Suppe des Tages', desc: 'Saisonal gekocht, täglich wechselnd', price: 6.5, emoji: '🥣' },
    { id: 'lemonade', category: 'Getränke', name: 'Hausgemachte Limonade', desc: 'Zitrone, Minze, wenig Zucker', price: 4, emoji: '🍋' },
  ],
  'pasta-club': [
    { id: 'pasta-carbonara', category: 'Pasta', name: 'Carbonara', desc: 'Guanciale, Eigelb, Pecorino, schwarzer Pfeffer', price: 13.5, emoji: '🍝' },
    { id: 'pasta-ragu', category: 'Pasta', name: 'Ragù della domenica', desc: 'Langsam geschmortes Rind, Parmesan', price: 15, emoji: '🍝' },
    { id: 'pasta-pesto', category: 'Pasta', name: 'Pesto Genovese', desc: 'Basilikumpesto, Pinienkerne, Parmesan', price: 12.5, emoji: '🌿' },
    { id: 'focaccia', category: 'Vorspeisen', name: 'Focaccia', desc: 'Rosmarin, Olivenöl, Meersalz', price: 5.5, emoji: '🥖' },
    { id: 'panna-cotta', category: 'Dessert', name: 'Panna Cotta', desc: 'Vanille, saisonaler Fruchtspiegel', price: 6.5, emoji: '🍮' },
  ],
};
const euro = (value) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);

export default function Home() {
  const [restaurant, setRestaurant] = useState(demoRestaurants[0]);
  const [step, setStep] = useState('restaurants');
  const [cart, setCart] = useState({});
  const [kind, setKind] = useState('pickup');
  const [requestedTime, setRequestedTime] = useState('ASAP');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [notice, setNotice] = useState('');
  const [category, setCategory] = useState('Alle');

  useEffect(() => {
    let cancelled = false;
    async function restorePage() {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('restaurant') || params.get('r');
      const found = demoRestaurants.find((item) => item.id === slug);
      if (found && !cancelled) { setRestaurant(found); setStep('menu'); }
      const orderId = params.get('demoOrder');
      if (orderId) {
        try {
          const savedOrder = await ordersRepository.getById(orderId);
          if (savedOrder && !cancelled) { setOrder(savedOrder); setRestaurant(savedOrder.restaurant); setStep('status'); }
        } catch {
          if (!cancelled) setNotice('Der Bestellstatus konnte gerade nicht geladen werden. Bitte aktualisiere die Seite.');
        }
      }
    }
    restorePage();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!order?.id) return undefined;
    const refreshOrder = async () => {
      try {
        const updated = await ordersRepository.getById(order.id);
        if (updated) setOrder(updated);
      } catch {
        // Keep the last known status visible if the network briefly drops.
      }
    };
    const timer = window.setInterval(refreshOrder, 5000);
    return () => window.clearInterval(timer);
  }, [order?.id]);

  const dishes = menus[restaurant.menu];
  const categories = ['Alle', ...new Set(dishes.map((item) => item.category))];
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = useMemo(() => dishes.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0), [cart]);
  const visibleDishes = category === 'Alle' ? dishes : dishes.filter((item) => item.category === category);
  function chooseRestaurant(item) { setRestaurant(item); setCart({}); setKind('pickup'); setCategory('Alle'); setStep('menu'); setNotice(''); window.history.replaceState({}, '', `/?restaurant=${item.id}`); }
  function add(item, delta) { setCart((current) => ({ ...current, [item.id]: Math.max(0, (current[item.id] || 0) + delta) })); }
  async function acceptTimeProposal() {
    const acceptedAt = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    try {
      const updatedOrder = await ordersRepository.update(order.id, { status: 'accepted', customerAcceptedAt: acceptedAt, restaurantReply: order.restaurantReply.replace(' Passt dir diese Zeit?', '') });
      setOrder(updatedOrder);
    } catch (error) { setNotice(error.message); }
  }
  async function requestDifferentTime() {
    try {
      const updatedOrder = await ordersRepository.update(order.id, { status: 'change_requested' });
      setOrder(updatedOrder);
    } catch (error) { setNotice(error.message); }
  }
  async function submitOrder(event) {
    event.preventDefault();
    if (!count) { setNotice('Wähle zuerst mindestens ein Gericht aus.'); return; }
    if (!name.trim() || !phone.trim()) { setNotice('Bitte gib deinen Namen und deine Telefonnummer ein.'); return; }
    const newOrder = { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`, number: `OP-${Math.floor(1000 + Math.random() * 9000)}`, restaurant, customerName: name.trim(), customerPhone: phone.trim(), total, kind, requestedTime, status: 'pending', createdAt: new Date().toISOString(), items: dishes.filter((item) => cart[item.id]).map((item) => ({ ...item, quantity: cart[item.id] })) };
    try {
      const savedOrder = await ordersRepository.create(newOrder);
      setOrder(savedOrder);
      window.history.replaceState({}, '', `/?demoOrder=${savedOrder.id}`);
      setStep('status'); setNotice('');
    } catch (error) { setNotice(error.message); }
  }

  return <main className="platformPage">
    <header className="platformNav"><a className="brand" href="/" onClick={(event) => { event.preventDefault(); setStep('restaurants'); window.history.replaceState({}, '', '/'); }}><span className="brandMark">O</span><span>OrderPilot<span className="brandLight">Platform</span></span></a><div className="navRight"><span className="demoPill"><i /> DEMO · KEINE ECHTEN BESTELLUNGEN</span><button className="navCart" onClick={() => setStep('checkout')}>Warenkorb <b>{count}</b></button></div></header>
    <div className="platformContent">
      {step === 'restaurants' && <>
        <div className="platformHero"><span className="eyebrow">GUT ESSEN, GANZ EINFACH</span><h1>Dein nächstes<br /><em>Lieblingsrestaurant.</em></h1><p>Entdecke Restaurants in deiner Nähe und bestelle direkt bei deinem Lieblingsladen.</p><div className="searchFake">⌕ <span>Restaurant oder Küche suchen</span><button>Berlin, Deutschland⌄</button></div><div className="heroNote">⌖ &nbsp; Restaurants in Berlin, Deutschland <span>•</span> 3 Orte entdecken</div></div>
        <section className="restaurantsSection"><div className="sectionHeading"><div><span className="eyebrow">FÜR DICH AUSGEWÄHLT</span><h2>Restaurants in deiner Nähe</h2></div><button className="textButton">Alle anzeigen ↗</button></div><div className="restaurantGrid">{demoRestaurants.map((item, index) => <button className="restaurantCard" key={item.id} onClick={() => chooseRestaurant(item)}><div className="restaurantPhoto" style={{ backgroundColor: item.color, backgroundImage: `linear-gradient(0deg,rgba(20,30,23,.2),transparent 48%),url("${item.image}")` }}><span className="openTag">● Jetzt geöffnet</span>{index === 0 && <span className="favoriteTag">★ Beliebt</span>}</div><div className="restaurantInfo"><div className="restaurantNameRow"><h3>{item.name}</h3><span className="rating">★ {item.rating}</span></div><p>{item.type}</p><div className="restaurantMeta"><span>◷ {item.time}</span><span>⌖ {item.area}</span></div><div className="restaurantDescription">{item.description}</div></div></button>)}</div></section>
        <div className="qrCallout"><div className="qrIcon">▦</div><div><strong>Schon im Restaurant?</strong><span>Scanne einfach den QR-Code auf deinem Tisch und bestelle direkt.</span></div><span className="qrDemo">BEISPIEL: <code>/?restaurant=wunderteig</code></span></div>
      </>}
      {step === 'menu' && <>
        <button className="backLink" onClick={() => setStep('restaurants')}>← Alle Restaurants</button><div className="menuHero" style={{ backgroundImage: `linear-gradient(90deg,rgba(14,31,20,.84),rgba(14,31,20,.12)),url("${restaurant.image}")` }}><span className="eyebrow">{restaurant.type.toUpperCase()}</span><h1>{restaurant.name}</h1><p>{restaurant.description}</p><div className="menuBadges"><span>★ {restaurant.rating}</span><span>◷ {restaurant.time}</span><span>● Jetzt geöffnet</span></div></div>
        <div className="menuLayout"><section><div className="sectionHeading menuSectionHeading"><div><span className="eyebrow">FRISCH FÜR DICH</span><h2>Unsere Speisekarte</h2></div><span className="menuAddress">⌖ {restaurant.area}</span></div><div className="categoryTabs">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><div className="dishList">{visibleDishes.map((item) => <article className="dishCard" key={item.id}><div className="dishEmoji">{item.emoji}</div><div className="dishText"><span className="dishCategory">{item.category}</span><h3>{item.name}</h3><p>{item.desc}</p><strong>{euro(item.price)}</strong></div><div className="dishControls">{cart[item.id] > 0 && <><button aria-label="Weniger" onClick={() => add(item, -1)}>−</button><b>{cart[item.id]}</b></>}<button aria-label="Hinzufügen" onClick={() => add(item, 1)}>+</button></div></article>)}</div></section><aside className="orderAside"><div className="asideTitle"><div><span className="eyebrow">DEINE BESTELLUNG</span><h3>Warenkorb</h3></div><span className="cartCount">{count}</span></div>{count ? <>{dishes.filter((item) => cart[item.id]).map((item) => <div className="cartLine" key={item.id}><span>{cart[item.id]} × {item.name}</span><b>{euro(item.price * cart[item.id])}</b></div>)}<div className="cartTotal"><span>Zwischensumme</span><strong>{euro(total)}</strong></div><button className="primaryButton wide" onClick={() => setStep('checkout')}>Weiter zur Kasse <span>→</span></button></> : <div className="emptyCart"><span>＋</span><p>Dein Warenkorb ist noch leer.</p><small>Füge Gerichte hinzu, die dir schmecken.</small></div>}<div className="asideFoot">▢ &nbsp; {restaurant.delivery ? `Lieferung ${euro(restaurant.deliveryFee)} · Selbstabholung kostenlos` : 'Nur Selbstabholung verfügbar'}</div></aside></div>
        {count > 0 && <button className="mobileCheckout" onClick={() => setStep('checkout')}>Warenkorb · {count} Artikel <strong>{euro(total)} →</strong></button>}
      </>}
      {step === 'checkout' && <><button className="backLink" onClick={() => setStep('menu')}>← Zurück zum Menü</button><div className="checkoutHeader"><span className="eyebrow">FAST GESCHAFFT</span><h1>Deine Bestellung.</h1><p>Direkt bei <strong>{restaurant.name}</strong> – ohne Umwege.</p></div><form className="checkoutGrid" onSubmit={submitOrder}><section className="checkoutCard"><h2>Wie möchtest du bestellen?</h2><div className="choiceGrid"><button type="button" className={`choiceCard ${kind === 'pickup' ? 'selected' : ''}`} onClick={() => setKind('pickup')}><span>🏃</span><strong>Selbst abholen</strong><small>Kostenlos</small></button>{restaurant.delivery && <button type="button" className={`choiceCard ${kind === 'delivery' ? 'selected' : ''}`} onClick={() => setKind('delivery')}><span>🚲</span><strong>Lieferung</strong><small>Gebühr: {euro(restaurant.deliveryFee)}</small></button>}</div><label className="fieldLabel">Wann passt es dir?<select value={requestedTime} onChange={(event) => setRequestedTime(event.target.value)}><option>ASAP</option><option>In 30 Minuten</option><option>In 45 Minuten</option><option>In 1 Stunde</option><option>Später am Abend</option></select></label><h2 className="detailsHeading">Deine Kontaktdaten</h2><div className="formColumns"><label className="fieldLabel">Vor- und Nachname<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Beispiel" /></label><label className="fieldLabel">Telefonnummer<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+49 170 1234567" /></label></div>{kind === 'delivery' && <><h2 className="detailsHeading">Lieferadresse</h2><div className="formColumns"><label className="fieldLabel">Straße<input placeholder="Musterstraße" /></label><label className="fieldLabel">Hausnummer<input placeholder="12" /></label><label className="fieldLabel">Postleitzahl<input placeholder="10115" /></label><label className="fieldLabel">Stadt<input placeholder="Berlin" /></label></div></>}{notice && <p className="formNotice">{notice}</p>}<p className="demoNotice">Testmodus: Bestellung und Kontaktdaten werden in der gemeinsamen Supabase-Testdatenbank gespeichert. Es werden keine echten Nachrichten versendet.</p></section><aside className="orderAside checkoutSummary"><span className="eyebrow">DEINE AUSWAHL</span><h3>{restaurant.name}</h3>{dishes.filter((item) => cart[item.id]).map((item) => <div className="cartLine" key={item.id}><span>{cart[item.id]} × {item.name}</span><b>{euro(item.price * cart[item.id])}</b></div>)}<div className="cartLine"><span>{kind === 'delivery' ? 'Liefergebühr' : 'Selbstabholung'}</span><b>{kind === 'delivery' ? euro(restaurant.deliveryFee) : 'Kostenlos'}</b></div><div className="cartTotal"><strong>Gesamt</strong><strong>{euro(total + (kind === 'delivery' ? restaurant.deliveryFee : 0))}</strong></div><button className="primaryButton wide" type="submit">Demo-Bestellung aufgeben →</button></aside></form></>}
      {step === 'status' && order && <div className="statusPage">
        <div className="statusCheck">{order.status === 'accepted' ? '✓' : order.status === 'proposed' ? '◷' : '…'}</div>
        <span className="eyebrow">DEMO-BESTELLUNG · {order.number}</span>
        <h1>{order.status === 'completed' ? 'Bestellung abgeschlossen.' : order.status === 'accepted' ? 'Zeit bestätigt.' : order.status === 'proposed' ? 'Zeitvorschlag vom Restaurant.' : order.status === 'change_requested' ? 'Andere Zeit angefragt.' : 'Anfrage gesendet.'}</h1>
        <p className="statusIntro">{order.status === 'completed' ? 'Das Restaurant hat deine Bestellung als abgeschlossen markiert.' : order.status === 'accepted' ? 'Du hast die vorgeschlagene Zeit bestätigt.' : order.status === 'proposed' ? 'Das Restaurant hat eine Zeit vorgeschlagen. Passt sie für dich?' : order.status === 'change_requested' ? 'Das Restaurant erhält deine Bitte und kann eine andere Zeit vorschlagen.' : 'Deine Anfrage ist beim Restaurant eingegangen. Warte auf einen Zeitvorschlag.'}</p>
        <div className="statusRestaurant"><div className="statusAvatar">{order.restaurant.name.charAt(0)}</div><div><strong>{order.restaurant.name}</strong><span>Dein Restaurant</span></div><span className="statusLive">DEMO</span></div>
        <div className="responseCard"><span className="responseLabel">{order.status === 'pending' ? 'WARTET AUF RESTAURANT' : order.status === 'change_requested' ? 'ANDERE ZEIT ANGEFRAGT' : `ZEITVORSCHLAG DES RESTAURANTS · ${order.proposedAt}`}</span><div className="responseMessage">{order.status === 'pending' ? 'Deine Bestellung ist beim Restaurant eingegangen. Sobald das Team eine Zeit vorschlägt, erscheint sie hier.' : order.status === 'change_requested' ? 'Du hast um eine andere Zeit gebeten. Das Restaurant kann dir einen neuen Vorschlag senden.' : order.restaurantReply}</div>{['proposed', 'accepted'].includes(order.status) && <div className="confirmedTime"><span>{order.status === 'accepted' ? 'VON DIR BESTÄTIGTE ZEIT' : 'VORGESCHLAGENE ZEIT'}</span><strong>{order.confirmedTime} Uhr</strong></div>}</div>
        {order.status === 'proposed' && <div className="proposalActions"><button className="primaryButton" onClick={acceptTimeProposal}>Zeit passt – bestätigen ✓</button><button className="secondaryButton" onClick={requestDifferentTime}>Zeit passt nicht</button></div>}
        <div className="statusTimeline"><div className="timelineDone"><i>✓</i><div><strong>Anfrage gesendet</strong><span>Gerade eben</span></div></div><div className={['proposed', 'accepted'].includes(order.status) ? 'timelineDone' : ''}><i>{['proposed', 'accepted'].includes(order.status) ? '✓' : '2'}</i><div><strong>{order.status === 'pending' ? 'Wartet auf Restaurant' : order.status === 'change_requested' ? 'Andere Zeit angefragt' : 'Restaurant hat Zeit vorgeschlagen'}</strong><span>{order.status === 'pending' ? 'Das Restaurant prüft deine Anfrage' : order.status === 'change_requested' ? 'Das Restaurant prüft deine Bitte' : `Fertig um ${order.confirmedTime} Uhr`}</span></div></div>{order.status === 'accepted' && <div className="timelineDone"><i>✓</i><div><strong>Zeit von dir bestätigt</strong><span>Um {order.customerAcceptedAt}</span></div></div>}</div>
        <div className="statusOrderSummary"><strong>Deine Bestellung</strong>{order.items.map((item) => <span key={item.id}>{item.quantity} × {item.name}</span>)}<div><strong>Gesamt</strong><strong>{euro(order.total + (order.kind === 'delivery' ? order.restaurant.deliveryFee : 0))}</strong></div></div>
        <button className="primaryButton" onClick={() => { setStep('restaurants'); setCart({}); setOrder(null); window.history.replaceState({}, '', '/'); }}>Weitere Restaurants entdecken →</button>
        <p className="demoNotice">Testmodus: Bestellung und Status werden über Supabase zwischen Kunden- und Restaurantansicht synchronisiert. Es werden keine echten Nachrichten versendet.</p>
      </div>}
    </div><footer className="platformFooter"><a className="brand" href="/" onClick={(event) => { event.preventDefault(); setStep('restaurants'); }}><span className="brandMark">O</span><span>OrderPilot<span className="brandLight">Platform</span></span></a><span>Ein Ort für gutes Essen und gute Gastgeber.</span><a href="/restaurant">Restaurant-Demo ↗</a><a href="/legacy">Zum bisherigen OrderPilot ↗</a></footer>
  </main>;
}

'use client';

import { useMemo, useState } from 'react';

const WHATSAPP = '380504548551';
const TELEGRAM = 'https://t.me/wunderteig';

const pizzas = [
  {
    id: 'margherita',
    name: 'Margherita',
    ingredients: 'Tomate · Mozzarella · Basilikum',
    price: 9.5,
    emoji: '🍅',
  },
  {
    id: 'salame',
    name: 'Salame',
    ingredients: 'Tomate · Mozzarella · Salami',
    price: 11.5,
    emoji: '🌶️',
  },
  {
    id: 'diavola',
    name: 'Diavola',
    ingredients: 'Tomate · Mozzarella · scharfe Salami · Chili',
    price: 12.5,
    emoji: '🔥',
  },
  {
    id: 'prosciutto',
    name: 'Prosciutto',
    ingredients: 'Tomate · Mozzarella · Schinken',
    price: 11.5,
    emoji: '🥩',
  },
];

export default function Home() {
  const [cart, setCart] = useState({});

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    time: '',
  });

  const changeQuantity = (id, amount) => {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[id] || 0) + amount;

      if (quantity <= 0) {
        delete next[id];
      } else {
        next[id] = quantity;
      }

      return next;
    });
  };

  const cartItems = useMemo(() => {
    return pizzas
      .filter((pizza) => cart[pizza.id])
      .map((pizza) => ({
        ...pizza,
        quantity: cart[pizza.id],
      }));
  }, [cart]);

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const scrollToCart = () => {
    document
      .getElementById('bestellung')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendOrder = () => {
    if (!cartItems.length) {
      alert('Bitte wählen Sie mindestens eine Pizza aus.');
      return;
    }

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim() ||
      !customer.time.trim()
    ) {
      alert('Bitte füllen Sie alle Felder aus.');
      scrollToCart();
      return;
    }

    const orderLines = cartItems
      .map(
        (item) =>
          `${item.quantity} × ${item.name} — ${(item.price * item.quantity)
            .toFixed(2)
            .replace('.', ',')} €`
      )
      .join('\n');

    const message = `Hallo Wunderteig! 👋

Ich möchte gerne bestellen:

${orderLines}

Gesamt: ${total.toFixed(2).replace('.', ',')} €

Kundendaten:

Name: ${customer.name}
Telefon: ${customer.phone}
Adresse / Ort: ${customer.address}
Wunschzeit: ${customer.time}

Vielen Dank!`;

    const whatsappUrl =
      `https://wa.me/${WHATSAPP}?text=` +
      encodeURIComponent(message);

    window.open(whatsappUrl, '_blank');
  };

  return (
    <main>

      {/* ================= NAVIGATION ================= */}

      <header className="nav">
        <a href="#" className="logo">
          WUNDER<span>TEIG</span>
        </a>

        <nav>
          <a href="#pizza">Pizza</a>
          <a href="#about">Über uns</a>
          <a href="#contact">Kontakt</a>
        </nav>

        <div className="navRight">
          {cartItems.length > 0 && (
            <button
              type="button"
              className="navCart"
              onClick={scrollToCart}
            >
              🛒 {totalQuantity} ·{' '}
              {total.toFixed(2).replace('.', ',')} €
            </button>
          )}

          <a className="navOrder" href="#pizza">
            Bestellen
          </a>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="heroText">

          <p className="eyebrow">
            PIZZAMOBIL · GRAFING & UMGEBUNG
          </p>

          <h1>
            Pizza, die
            <br />
            <em>zu dir kommt.</em>
          </h1>

          <p className="lead">
            Handgemachter Teig, gute Zutaten und richtig heißer Ofen.
            Wunderteig bringt frische Pizza direkt zu deinem Event.
          </p>

          <div className="actions">
            <a className="primary" href="#pizza">
              Pizza auswählen →
            </a>

            <a
              className="primary"
              href={TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#229ED9' }}
            >
              Telegram
            </a>
          </div>

          <div className="trust">
            <span>🔥 Ofenfrisch</span>
            <span>🍕 Handgemacht</span>
            <span>📍 Mobil</span>
          </div>

        </div>

        <div className="pizzaVisual">
          <div className="pizza">🍕</div>
        </div>

      </section>

      {/* ================= PIZZA ================= */}

      <section id="pizza" className="section">

        <div className="sectionHead">
          <p className="eyebrow">
            UNSERE KLASSIKER
          </p>

          <h2>
            Einfach gute Pizza.
          </h2>
        </div>

        <div className="cards">

          {pizzas.map((pizza) => (

            <article className="card" key={pizza.id}>

              <div className="cardTop">

                <span>{pizza.emoji}</span>

                <strong>
                  {pizza.price.toFixed(2).replace('.', ',')} €
                </strong>

              </div>

              <h3>{pizza.name}</h3>

              <p>{pizza.ingredients}</p>

              <div className="quantity">

                <button
                  type="button"
                  onClick={() =>
                    changeQuantity(pizza.id, -1)
                  }
                >
                  −
                </button>

                <span>
                  {cart[pizza.id] || 0}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    changeQuantity(pizza.id, 1)
                  }
                >
                  +
                </button>

              </div>

            </article>

          ))}

        </div>

      </section>

      {/* ================= ORDER ================= */}

      <section
        id="bestellung"
        className="orderSection"
      >

        <div className="orderBox">

          <p className="eyebrow">
            DEINE BESTELLUNG
          </p>

          <h2>
            {cartItems.length
              ? 'Alles bereit?'
              : 'Wähle deine Pizza.'}
          </h2>

          {!cartItems.length && (
            <p className="emptyCartText">
              Wähle oben deine Lieblingspizza aus.
            </p>
          )}

          {cartItems.length > 0 && (
            <>

              {/* CUSTOMER FORM */}

              <div className="customerForm">

                <h3>
                  Deine Daten
                </h3>

                <input
                  type="text"
                  placeholder="Name"
                  value={customer.name}
                  onChange={(e) =>
                    updateCustomer(
                      'name',
                      e.target.value
                    )
                  }
                />

                <input
                  type="tel"
                  placeholder="Telefon"
                  value={customer.phone}
                  onChange={(e) =>
                    updateCustomer(
                      'phone',
                      e.target.value
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Adresse / Ort"
                  value={customer.address}
                  onChange={(e) =>
                    updateCustomer(
                      'address',
                      e.target.value
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Wunschzeit, z. B. 19:30"
                  value={customer.time}
                  onChange={(e) =>
                    updateCustomer(
                      'time',
                      e.target.value
                    )
                  }
                />

              </div>

              {/* CART */}

              <div className="cart">

                <div className="cartHeader">
                  <span>
                    Deine Auswahl
                  </span>

                  <span>
                    {totalQuantity}{' '}
                    {totalQuantity === 1
                      ? 'Pizza'
                      : 'Pizzen'}
                  </span>
                </div>

                {cartItems.map((item) => (

                  <div
                    className="cartRow"
                    key={item.id}
                  >

                    <span>
                      {item.quantity} × {item.name}
                    </span>

                    <strong>
                      {(item.price * item.quantity)
                        .toFixed(2)
                        .replace('.', ',')}{' '}
                      €
                    </strong>

                  </div>

                ))}

                <div className="total">

                  <span>
                    Gesamt
                  </span>

                  <strong>
                    {total.toFixed(2).replace('.', ',')} €
                  </strong>

                </div>

                <button
                  type="button"
                  className="whatsappButton"
                  onClick={sendOrder}
                >
                  WhatsApp-Bestellung senden →
                </button>

                <a
                  href={TELEGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary"
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: '12px',
                    textAlign: 'center',
                    background: '#229ED9',
                  }}
                >
                  Über Telegram kontaktieren →
                </a>

              </div>

            </>
          )}

        </div>

      </section>

      {/* ================= ABOUT ================= */}

      <section
        id="about"
        className="darkSection"
      >

        <div>

          <p className="eyebrow light">
            WUNDERTEIG
          </p>

          <h2>
            Pizza ohne
            <br />
            <em>Umwege.</em>
          </h2>

        </div>

        <p className="aboutText">
          Wir kommen mit unserem mobilen Pizza-Konzept
          zu dir – auf dein Fest, deine Firmenfeier,
          deinen Geburtstag oder einfach dorthin,
          wo gute Pizza gebraucht wird.
        </p>

      </section>

      {/* ================= CONTACT ================= */}

      <section
        id="contact"
        className="contact"
      >

        <p className="eyebrow">
          BEREIT?
        </p>

        <h2>
          Deine Pizza ist
          <br />
          nur eine Nachricht entfernt.
        </h2>

        <div className="actions center">

          <a
            className="primary"
            href="#pizza"
          >
            Pizza bestellen
          </a>

          <a
            className="primary"
            href={TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#229ED9' }}
          >
            Telegram schreiben
          </a>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer>

        <div className="logo">
          WUNDER<span>TEIG</span>
        </div>

        <p>
          © 2026 Wunderteig · Pizzamobil
        </p>

      </footer>

      {/* ================= FLOATING CART ================= */}

      {cartItems.length > 0 && (
        <button
          type="button"
          className="floatingCart"
          onClick={scrollToCart}
        >

          <span className="floatingCartIcon">
            🛒
          </span>

          <span className="floatingCartInfo">
            <strong>
              {totalQuantity}{' '}
              {totalQuantity === 1
                ? 'Pizza'
                : 'Pizzen'}
            </strong>

            <small>
              Zum Warenkorb
            </small>
          </span>

          <strong className="floatingCartPrice">
            {total.toFixed(2).replace('.', ',')} €
          </strong>

        </button>
      )}

    </main>
  );
}
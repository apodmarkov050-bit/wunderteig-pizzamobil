
'use client';

import { useMemo, useState } from 'react';
const WHATSAPP = '380504548551';
const TELEGRAM = 'https://t.me/wunderteig';
const PHONE = '+491637088347';
const translations = {
  de: {
    menu: 'Menü',
    about: 'Über uns',
    contact: 'Kontakt',
    specialOffer: 'Unser Spezialangebot',
    specialOfferTitle: 'Unser Spezialangebot',
specialOfferDescription: 'Entdecke unser besonderes Angebot für dich!',
specialOfferButton: 'Menü entdecken →',
    order: 'Bestellen',
    heroTitle: 'Pizza, die',
    heroTitleSecond: 'zu dir kommt.',
    heroDescription:
      'Handgemachter Teig, gute Zutaten und richtig heißer Ofen. Wunderteig bringt frische Pizza direkt zu deinem Event.',
    discoverMenu: 'Menü entdecken →',
    telegram: 'Telegram schreiben',
    whatsapp: 'WhatsApp schreiben',
    ovenFresh: '🔥 Ofenfrisch',
    handmade: '🍕 Handgemacht',
    mobile: '📍 Mobil',
    ourMenu: 'UNSER MENÜ',
    whatWouldYouLike: 'Was möchtest du?',
    discover: 'Entdecken →',
    yourOrder: 'DEINE BESTELLUNG',
    ready: 'Alles bereit?',
    chooseDishes: 'Wähle deine Gerichte.',
    chooseFavorite: 'Wähle oben deine Lieblingsgerichte aus.',
    yourDetails: 'Deine Daten',
    name: 'Name',
    phone: 'Telefon',
    howReceive: 'Wie möchtest du deine Bestellung erhalten?',
    pickup: '🏪 Abholung',
    delivery: '🚚 Lieferung',
    street: 'Straße',
    houseNumber: 'Hausnummer',
    postalCode: 'PLZ',
    city: 'Ort',
    floor: 'Etage / Klingel (optional)',
    deliveryNote: 'Hinweis zur Lieferung (optional)',
    deliveryFee: 'Liefergebühr',
    pickupInfo: '🏪 Du holst deine Bestellung selbst im Restaurant ab.',
    desiredTime: 'Wunschzeit, z. B. 19:30',
    yourSelection: 'Deine Auswahl',
    item: 'Artikel',
items: 'Artikel',
    changeOrder: '← Bestellung ändern',
    subtotal: 'Zwischensumme',
    total: 'Gesamt',
    sendWhatsApp: 'WhatsApp-Bestellung senden →',
    sendTelegram: 'Telegram-Bestellung senden →',
    aboutTitle: 'Pizza ohne',
    aboutTitleSecond: 'Umwege.',
    aboutDescription:
      'Wir kommen mit unserem mobilen Pizza-Konzept zu dir – auf dein Fest, deine Firmenfeier, deinen Geburtstag oder einfach dorthin, wo gute Pizza gebraucht wird.',
    contactTitle: 'Deine Pizza ist',
    contactTitleSecond: 'nur eine Nachricht entfernt.',
    callDirectly: '📞 DIREKT ANRUFEN',
    phoneDescription: 'Telefonische Bestellung & Anfrage',
    viewMenu: 'Menü ansehen',
    cart: 'Zum Warenkorb',
    fewer: 'Weniger',
    more: 'Mehr',
    emptyOrder: 'Bitte wählen Sie mindestens einen Artikel aus.',
    missingDetails: 'Bitte füllen Sie Name, Telefon und Wunschzeit aus.',
    missingAddress: 'Bitte füllen Sie die Lieferadresse vollständig aus.',
    categoryDescriptions: {
      pizza: 'Handgemachte Pizza aus dem heißen Ofen.',
      pasta: 'Hausgemachte Pasta mit ausgewählten Zutaten.',
      salate: 'Frische Salate und leichte Gerichte.',
      burger: 'Saftige Burger mit hochwertigen Zutaten.',
      getraenke: 'Kalte Getränke passend zu deinem Essen.',
      alkohol: 'Bier, Wein und weitere alkoholische Getränke.',
      desserts: 'Etwas Süßes zum Abschluss.',
      
      yourDetails: 'Deine Daten',
receiveOrder: 'Wie möchtest du deine Bestellung erhalten?',
pickup: '🏪 Abholung',
delivery: '🚚 Lieferung',
pickupDescription: '🏪 Du holst deine Bestellung selbst im Restaurant ab.',
deliveryDescription: '🚚 Deine Bestellung wird zu dir geliefert.',
preferredTime: 'Wunschzeit, z. B. 19:30',
    },
    categoryTitles: {
      pizza: 'Einfach gute Pizza.',
      pasta: 'Hausgemachte Pasta.',
      salate: 'Frische Salate.',
      burger: 'Saftige Burger.',
      getraenke: 'Das passende Getränk.',
      alkohol: 'Bier, Wein und mehr.',
      desserts: 'Etwas Süßes zum Abschluss.',
    },
  },

  en: {
    menu: 'Menu',
    about: 'About us',
    contact: 'Contact',
    specialOffer: 'Our Special Offer',
    specialOfferTitle: 'Our Special Offer',
specialOfferDescription: 'Discover our special deal for you!',
specialOfferButton: 'Explore the menu →',
    order: 'Order now',
    heroTitle: 'Pizza that',
    heroTitleSecond: 'comes to you.',
    heroDescription:
      'Handmade dough, quality ingredients and a blazing-hot oven. Wunderteig brings fresh pizza straight to your event.',
    discoverMenu: 'Explore the menu →',
    telegram: 'Message on Telegram',
    whatsapp: 'Message on WhatsApp',
    ovenFresh: '🔥 Fresh from the oven',
    handmade: '🍕 Handmade',
    mobile: '📍 Mobile',
    ourMenu: 'OUR MENU',
    whatWouldYouLike: 'What would you like?',
    discover: 'Explore →',
    yourOrder: 'YOUR ORDER',
    ready: 'Ready to order?',
    chooseDishes: 'Choose your dishes.',
    chooseFavorite: 'Choose your favorite dishes above.',
    yourDetails: 'Your details',
    name: 'Name',
    phone: 'Phone',
    howReceive: 'How would you like to receive your order?',
    pickup: '🏪 Pickup',
    delivery: '🚚 Delivery',
    street: 'Street',
    houseNumber: 'House number',
    postalCode: 'Postal code',
    city: 'City',
    floor: 'Floor / doorbell (optional)',
    deliveryNote: 'Delivery instructions (optional)',
    deliveryFee: 'Delivery fee',
    pickupInfo: '🏪 You can collect your order from the restaurant.',
    desiredTime: 'Preferred time, e.g. 7:30 PM',
    yourSelection: 'Your selection',
    item: 'item',
items: 'items',
    changeOrder: '← Edit order',
    subtotal: 'Subtotal',
    total: 'Total',
    sendWhatsApp: 'Place order via WhatsApp →',
    sendTelegram: 'Place order via Telegram →',
    aboutTitle: 'Pizza without',
    aboutTitleSecond: 'detours.',
    aboutDescription:
      'Our mobile pizza concept comes to you — for your party, company event, birthday or anywhere great pizza is needed.',
    contactTitle: 'Your pizza is',
    contactTitleSecond: 'just one message away.',
    callDirectly: '📞 CALL US',
    phoneDescription: 'Phone orders & enquiries',
    viewMenu: 'View menu',
    cart: 'View cart',
    fewer: 'Decrease',
    more: 'Increase',
    emptyOrder: 'Please select at least one item.',
    missingDetails: 'Please enter your name, phone number and preferred time.',
    missingAddress: 'Please complete the delivery address.',
    categoryDescriptions: {
      pizza: 'Handmade pizza fresh from the hot oven.',
      pasta: 'Homemade pasta with carefully selected ingredients.',
      salate: 'Fresh salads and light dishes.',
      burger: 'Juicy burgers made with quality ingredients.',
      getraenke: 'Cold drinks to go with your meal.',
      alkohol: 'Beer, wine and other alcoholic drinks.',
      desserts: 'Something sweet to finish.',
    },
    categoryTitles: {
      pizza: 'Simply great pizza.',
      pasta: 'Homemade pasta.',
      salate: 'Fresh salads.',
      burger: 'Juicy burgers.',
      getraenke: 'The perfect drink.',
      alkohol: 'Beer, wine and more.',
      desserts: 'Something sweet to finish.',
    },
  },
};
const categories = [
  {
    id: 'pizza',
    name: 'Pizza',
   image: '/pizza-category-new.png',
    description: 'Handgemachte Pizza aus dem heißen Ofen.',
    products: [
      { id: 'margherita', name: 'Margherita', ingredients: 'Tomate · Mozzarella · Basilikum', price: 9.5, emoji: '🍅' },
      { id: 'salame', name: 'Salame', ingredients: 'Tomate · Mozzarella · Salami', price: 11.5, emoji: '🌶️' },
      { id: 'diavola', name: 'Diavola', ingredients: 'Tomate · Mozzarella · scharfe Salami · Chili', price: 12.5, emoji: '🔥' },
      { id: 'prosciutto', name: 'Prosciutto', ingredients: 'Tomate · Mozzarella · Schinken', price: 11.5, emoji: '🥩' },
    ],
  },
  {
    id: 'pasta',
    name: 'Pasta',
   image: '/pasta-category.jpg',
    description: 'Hausgemachte Pasta mit ausgewählten Zutaten.',
    products: [
      { id: 'carbonara', name: 'Carbonara', ingredients: 'Pasta · Speck · Ei · Parmesan', price: 12.5, emoji: '🍝' },
      { id: 'bolognese', name: 'Bolognese', ingredients: 'Pasta · Rindfleisch · Tomatensauce · Parmesan', price: 13, emoji: '🍝' },
      { id: 'arrabbiata', name: 'Arrabbiata', ingredients: 'Pasta · Tomate · Chili · Knoblauch', price: 11.5, emoji: '🌶️' },
      { id: 'pesto', name: 'Pesto', ingredients: 'Pasta · Basilikum-Pesto · Parmesan', price: 11, emoji: '🌿' },
    ],
  },
  {
    id: 'salate',
    name: 'Salate',
   image: '/salat-category.jpg',
    description: 'Frische Salate und leichte Gerichte.',
    products: [
      { id: 'caesar', name: 'Caesar Salat', ingredients: 'Salat · Parmesan · Croutons · Caesar-Dressing', price: 10.5, emoji: '🥗' },
      { id: 'gemischter-salat', name: 'Gemischter Salat', ingredients: 'Blattsalat · Tomate · Gurke · Paprika', price: 8.5, emoji: '🥬' },
      { id: 'tomaten-mozzarella', name: 'Tomate-Mozzarella', ingredients: 'Tomate · Mozzarella · Basilikum · Olivenöl', price: 9.5, emoji: '🍅' },
      { id: 'griechischer-salat', name: 'Griechischer Salat', ingredients: 'Tomate · Gurke · Feta · Oliven · Zwiebel', price: 10.5, emoji: '🫒' },
    ],
  },
  {
    id: 'burger',
    name: 'Burger',
   image: '/burger-category.png',
    description: 'Saftige Burger mit hochwertigen Zutaten.',
    products: [
      { id: 'classic-burger', name: 'Classic Burger', ingredients: 'Rindfleisch · Salat · Tomate · Zwiebel · Sauce', price: 12.5, emoji: '🍔' },
      { id: 'cheeseburger', name: 'Cheeseburger', ingredients: 'Rindfleisch · Cheddar · Salat · Tomate · Sauce', price: 13.5, emoji: '🍔' },
      { id: 'bbq-burger', name: 'BBQ Burger', ingredients: 'Rindfleisch · Cheddar · Bacon · BBQ-Sauce', price: 14.5, emoji: '🥓' },
      { id: 'veggie-burger', name: 'Veggie Burger', ingredients: 'Gemüse-Patty · Salat · Tomate · Sauce', price: 12, emoji: '🥬' },
    ],
  },
  {
    id: 'getraenke',
    name: 'Getränke',
   image: '/getraenke-category.png',
    description: 'Kalte Getränke passend zu deinem Essen.',
    products: [
      { id: 'cola', name: 'Cola', ingredients: '0,33 l', price: 3, emoji: '🥤' },
      { id: 'cola-zero', name: 'Cola Zero', ingredients: '0,33 l', price: 3, emoji: '🥤' },
      { id: 'wasser', name: 'Wasser', ingredients: '0,5 l', price: 2.5, emoji: '💧' },
      { id: 'apfelschorle', name: 'Apfelschorle', ingredients: '0,33 l', price: 3, emoji: '🍎' },
    ],
  },
  {
    id: 'alkohol',
    name: 'Alkoholische Getränke',
  image: '/alkoholische-getraenke-category.png',
    description: 'Bier, Wein und weitere alkoholische Getränke.',
    products: [
      { id: 'bier', name: 'Bier', ingredients: '0,5 l', price: 4, emoji: '🍺' },
      { id: 'weisswein', name: 'Weißwein', ingredients: '0,2 l', price: 5.5, emoji: '🥂' },
      { id: 'rotwein', name: 'Rotwein', ingredients: '0,2 l', price: 5.5, emoji: '🍷' },
      { id: 'prosecco', name: 'Prosecco', ingredients: '0,2 l', price: 6, emoji: '🥂' },
    ],
  },
  {
  id: 'desserts',
  name: 'Desserts',
  image: '/desserts-category.png',
  description: 'Etwas Süßes zum Abschluss.',
  products: [
      { id: 'tiramisu', name: 'Tiramisu', ingredients: 'Mascarpone · Kaffee · Kakao · Löffelbiskuit', price: 6.5, emoji: '🍰' },
      { id: 'panna-cotta', name: 'Panna Cotta', ingredients: 'Sahne · Vanille · Frucht-Sauce', price: 6, emoji: '🍮' },
      { id: 'schokoladenkuchen', name: 'Schokoladenkuchen', ingredients: 'Schokolade · Kakao · Sahne', price: 6.5, emoji: '🍫' },
      { id: 'gelato', name: 'Gelato', ingredients: 'Italienisches Eis · verschiedene Sorten', price: 5.5, emoji: '🍨' },
    ],
  },
];

export default function Home() {
  const [cart, setCart] = useState({});
  const [language, setLanguage] = useState('de');
  const t = translations[language];
  const productTranslations = {
  margherita: {
    name: 'Margherita',
    ingredients: 'Tomato · Mozzarella · Basil',
  },
  salame: {
    name: 'Salami',
    ingredients: 'Tomato · Mozzarella · Salami',
  },
  diavola: {
    name: 'Diavola',
    ingredients: 'Tomato · Mozzarella · Spicy salami · Chili',
  },
  prosciutto: {
    name: 'Prosciutto',
    ingredients: 'Tomato · Mozzarella · Ham',
  },
  carbonara: {
    name: 'Carbonara',
    ingredients: 'Pasta · Bacon · Egg · Parmesan',
  },
  bolognese: {
    name: 'Bolognese',
    ingredients: 'Pasta · Beef · Tomato sauce · Parmesan',
  },
  arrabbiata: {
    name: 'Arrabbiata',
    ingredients: 'Pasta · Tomato · Chili · Garlic',
  },
  pesto: {
    name: 'Pesto',
    ingredients: 'Pasta · Basil pesto · Parmesan',
  },
  caesar: {
    name: 'Caesar Salad',
    ingredients: 'Lettuce · Parmesan · Croutons · Caesar dressing',
  },
  'gemischter-salat': {
    name: 'Mixed Salad',
    ingredients: 'Leaf lettuce · Tomato · Cucumber · Bell pepper',
  },
  'tomaten-mozzarella': {
    name: 'Tomato & Mozzarella',
    ingredients: 'Tomato · Mozzarella · Basil · Olive oil',
  },
  'griechischer-salat': {
    name: 'Greek Salad',
    ingredients: 'Tomato · Cucumber · Feta · Olives · Onion',
  },
  'classic-burger': {
    name: 'Classic Burger',
    ingredients: 'Beef · Lettuce · Tomato · Onion · Sauce',
  },
  cheeseburger: {
    name: 'Cheeseburger',
    ingredients: 'Beef · Cheddar · Lettuce · Tomato · Sauce',
  },
  'bbq-burger': {
    name: 'BBQ Burger',
    ingredients: 'Beef · Cheddar · Bacon · BBQ sauce',
  },
  'veggie-burger': {
    name: 'Veggie Burger',
    ingredients: 'Vegetable patty · Lettuce · Tomato · Sauce',
  },
  cola: { name: 'Cola', ingredients: '0.33 l' },
  'cola-zero': { name: 'Cola Zero', ingredients: '0.33 l' },
  wasser: { name: 'Water', ingredients: '0.5 l' },
  apfelschorle: { name: 'Apple spritzer', ingredients: '0.33 l' },
  bier: { name: 'Beer', ingredients: '0.5 l' },
  weisswein: { name: 'White wine', ingredients: '0.2 l' },
  rotwein: { name: 'Red wine', ingredients: '0.2 l' },
  prosecco: { name: 'Prosecco', ingredients: '0.2 l' },
  tiramisu: {
    name: 'Tiramisu',
    ingredients: 'Mascarpone · Coffee · Cocoa · Ladyfingers',
  },
  'panna-cotta': {
    name: 'Panna Cotta',
    ingredients: 'Cream · Vanilla · Fruit sauce',
  },
  schokoladenkuchen: {
    name: 'Chocolate cake',
    ingredients: 'Chocolate · Cocoa · Cream',
  },
  gelato: {
    name: 'Gelato',
    ingredients: 'Italian ice cream · Various flavours',
  },
};
  const [activeCategory, setActiveCategory] = useState('pizza');
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    time: '',
    pickupType: 'abholung',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    floor: '',
    deliveryNote: '',
  });

  const DELIVERY_FEE = 3;
  const currentCategory = categories.find(
    (category) => category.id === activeCategory
  );

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

  const cartItems = useMemo(
    () =>
      categories.flatMap((category) =>
        category.products
          .filter((product) => cart[product.id])
          .map((product) => ({
            ...product,
            categoryName: category.name,
            quantity: cart[product.id],
          }))
      ),
    [cart]
  );

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee =
    customer.pickupType === 'lieferung' ? DELIVERY_FEE : 0;

  const total = subtotal + deliveryFee;

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

  const scrollToMenu = () => {
    document
      .getElementById('sortiment')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const openCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setTimeout(() => {
      document
        .getElementById('sortiment')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const createOrderMessage = () => {
    const orderLines = cartItems
      .map(
        (item) =>
          `${item.quantity} × ${item.categoryName} — ${item.name} — ${(item.price * item.quantity)
            .toFixed(2)
            .replace('.', ',')} €`
      )
      .join('\n');

    const deliveryAddress =
      customer.pickupType === 'lieferung'
        ? `${customer.street} ${customer.houseNumber}
${customer.postalCode} ${customer.city}
${customer.floor ? `Etage / Klingel: ${customer.floor}\n` : ''}${customer.deliveryNote ? `Hinweis: ${customer.deliveryNote}\n` : ''}`
        : 'Abholung im Restaurant';

    return `Hallo Wunderteig! 👋

Ich möchte gerne bestellen:

${orderLines}

Zwischensumme: ${subtotal.toFixed(2).replace('.', ',')} €
${customer.pickupType === 'lieferung'
  ? `Lieferung: ${deliveryFee.toFixed(2).replace('.', ',')} €`
  : 'Abholung: 0,00 €'}
Gesamt: ${total.toFixed(2).replace('.', ',')} €

Kundendaten:
Name: ${customer.name}
Telefon: ${customer.phone}

${t.howReceive}: ${customer.pickupType === 'lieferung' ? t.delivery : t.pickup}

Adresse / Abholung:
${deliveryAddress}

Wunschzeit: ${customer.time}

Vielen Dank!`;
  };

  const validateOrder = () => {
    if (!cartItems.length) {
      alert('Bitte wählen Sie mindestens einen Artikel aus.');
      return false;
    }

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.time.trim()
    ) {
      alert('Bitte füllen Sie Name, Telefon und Wunschzeit aus.');
      scrollToCart();
      return false;
    }

    if (
      customer.pickupType === 'lieferung' &&
      (!customer.street.trim() ||
        !customer.houseNumber.trim() ||
        !customer.postalCode.trim() ||
        !customer.city.trim())
    ) {
      alert('Bitte füllen Sie die Lieferadresse vollständig aus.');
      scrollToCart();
      return false;
    }

    return true;
  };

  const sendOrder = () => {
    if (!validateOrder()) return;

    const message = createOrderMessage();
    const whatsappUrl =
      `https://wa.me/${WHATSAPP}?text=` +
      encodeURIComponent(message);

    window.open(whatsappUrl, '_blank');
  };

  const sendTelegramOrder = () => {
    if (!validateOrder()) return;

    const message = createOrderMessage();
    const telegramUrl =
      `${TELEGRAM}?text=` +
      encodeURIComponent(message);

    window.open(telegramUrl, '_blank');
  };

  return (
    <main>
      {/* NAVIGATION */}
      <header className="nav">
        <a href="#" className="logo">
          WUNDER<span>TEIG</span>
        </a>

        <nav>
         <a href="#menu">{t.menu}</a>
        <a href="#special-offer" className="specialOfferNav">
  {t.specialOffer}
</a>
<a href="#about">{t.about}</a>
<a href="#contact">{t.contact}</a>
        </nav>

        <div className="navRight">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
  <button
    type="button"
    onClick={() => setLanguage('de')}
    style={{
      border: '1px solid #ddd4c8',
      borderRadius: '8px',
      padding: '8px 10px',
      cursor: 'pointer',
      fontWeight: '700',
      background: language === 'de' ? '#c93b1f' : '#fbf8f2',
      color: language === 'de' ? '#ffffff' : '#181818',
    }}
  >
    DE
  </button>

  <button
    type="button"
    onClick={() => setLanguage('en')}
    style={{
      border: '1px solid #ddd4c8',
      borderRadius: '8px',
      padding: '8px 10px',
      cursor: 'pointer',
      fontWeight: '700',
      background: language === 'en' ? '#c93b1f' : '#fbf8f2',
      color: language === 'en' ? '#ffffff' : '#181818',
    }}
  >
    EN
  </button>
</div>
          {cartItems.length > 0 && (
            <button
              type="button"
              className="navCart"
              onClick={scrollToCart}
            >
              🛒 {totalQuantity} · {total.toFixed(2).replace('.', ',')} €
            </button>
          )}

          <a className="navOrder" href="#menu">
  {t.order}
</a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">
            {language === 'en'
  ? 'PIZZAMOBIL · GRAFING & SURROUNDINGS'
  : 'PIZZAMOBIL · GRAFING & UMGEBUNG'}
          </p>

          <h1>
  {t.heroTitle}
  <br />
  <em>{t.heroTitleSecond}</em>
</h1>

          <p className="lead">
           {t.heroDescription}
          </p>

          <div className="actions">
            <a className="primary" href="#menu">
              {t.discoverMenu}
            </a>

            <a
              href={TELEGRAM}
              target="_blank"
              rel="noreferrer"
              className="primary"
              style={{ background: '#229ED9' }}
            >
              {t.telegram}
            </a>

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="primary"
              style={{ background: '#25D366' }}
            >
             {t.whatsapp}
            </a>
          </div>

          <div className="trust">
            <span>🔥 Ofenfrisch</span>
            <span>🍕 Handgemacht</span>
            <span>📍 Mobil</span>
          </div>
        </div>

        <div className="pizzaVisual">
          <div className="pizza">
            <img
              src="/pizza-hero.png"
              alt="Neapolitan Pizza"
              className="pizzaImage"
            />
          </div>
        </div>
      </section>

      {/* MENU CATEGORIES */}
      <section id="menu" className="section">
        <div className="sectionHead">
         <p className="eyebrow">{t.ourMenu}</p>
<h2>{t.whatWouldYouLike}</h2>
        </div>

        <div
          className="categoryCards"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '24px',
            marginTop: '40px',
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => openCategory(category.id)}
              style={{
                border: '1px solid #ddd4c8',
                borderRadius: '28px',
                background: '#fbf8f2',
                padding: '40px 32px',
                minHeight: '270px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {category.image ? (
  <img
    src={category.image}
    alt={category.name}
    style={{
   width: '100%',
height: '190px',
      objectFit: 'contain',
      borderRadius: '18px',
      marginBottom: '24px',
      display: 'block',
      marginLeft: 'auto',
marginRight: 'auto',
    }}
  />
) : (
  <div style={{ fontSize: '58px', marginBottom: '24px' }}>
    {category.emoji}
  </div>
)}

              <h3
                style={{
                  fontSize: '32px',
                  margin: '0 0 12px',
                  color: '#181818',
                }}
              >
               {language === 'en'
  ? ({
      pizza: 'Pizza',
      pasta: 'Pasta',
      salate: 'Salads',
      burger: 'Burgers',
      getraenke: 'Drinks',
      alkohol: 'Alcoholic Drinks',
      desserts: 'Desserts',
    }[category.id])
  : category.name}
              </h3>

              <p
                style={{
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#77716a',
                  margin: '0 0 24px',
                }}
              >
                {t.categoryDescriptions[category.id]}
              </p>

              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#c93b1f',
                }}
              >
               {t.discover}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ASSORTMENT */}
      <section id="sortiment" className="section">
        <div className="sectionHead">
          <p className="eyebrow">
            {currentCategory.emoji} {currentCategory.name.toUpperCase()}
          </p>

          <h2>
           {language === 'en'
  ? t.categoryTitles[currentCategory.id]
  : (
      currentCategory.name === 'Pizza'
        ? 'Einfach gute Pizza.'
        : currentCategory.name === 'Pasta'
        ? 'Hausgemachte Pasta.'
        : currentCategory.name === 'Salate'
        ? 'Frische Salate.'
        : currentCategory.name === 'Burger'
        ? 'Saftige Burger.'
        : currentCategory.name === 'Getränke'
        ? 'Das passende Getränk.'
        : currentCategory.name === 'Alkoholische Getränke'
        ? 'Bier, Wein und mehr.'
        : 'Etwas Süßes zum Abschluss.'
    )}
          </h2>
        </div>

        <div
          className="categoryButtons"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '45px',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: '14px 24px',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: '700',
                background:
                  activeCategory === category.id ? '#c93b1f' : '#e7e0d5',
                color: activeCategory === category.id ? '#ffffff' : '#181818',
              }}
            >
            {category.image ? (
  <img
    src={category.image}
    alt={category.name}
    className="categoryImage"
  />
) : (
  <span>{category.emoji}</span>
)}{" "}
{language === 'en'
  ? ({
      pizza: 'Pizza',
      pasta: 'Pasta',
      salate: 'Salads',
      burger: 'Burgers',
      getraenke: 'Drinks',
      alkohol: 'Alcoholic Drinks',
      desserts: 'Desserts',
    }[category.id])
  : category.name}
            </button>
          ))}
        </div>

        <div className="cards">
          {currentCategory.products.map((product) => (
            <article className="card" key={product.id}>
              <div className="cardTop">
                <span>{product.emoji}</span>
                <strong>{product.price.toFixed(2).replace('.', ',')} €</strong>
              </div>

             <h3>
  {language === 'en'
    ? productTranslations[product.id]?.name || product.name
    : product.name}
</h3>
     <p>
  {language === 'en'
    ? productTranslations[product.id]?.ingredients || product.ingredients
    : product.ingredients}
</p>         

              <div className="quantity">
                <button
                  type="button"
                  onClick={() => changeQuantity(product.id, -1)}
                >
                  −
                </button>

                <span>{cart[product.id] || 0}</span>

                <button
                  type="button"
                  onClick={() => changeQuantity(product.id, 1)}
                >
                  +
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ORDER */}
      <section id="bestellung" className="orderSection">
        <div className="orderBox">
         <p className="eyebrow">{t.yourOrder}</p>

          <h2>
           {cartItems.length
  ? t.ready
  : t.chooseDishes}
          </h2>

          {!cartItems.length && (
            <p className="emptyCartText">
             {t.chooseFavorite}
            </p>
          )}

          {cartItems.length > 0 && (
            <>
              {/* CUSTOMER FORM */}
              <div className="customerForm">
                <h3>{t.yourDetails}</h3>

                <input
                  type="text"
                  placeholder="Name"
                  value={customer.name}
                  onChange={(e) => updateCustomer('name', e.target.value)}
                />

                <input
                  type="tel"
                  placeholder="Telefon"
                  value={customer.phone}
                  onChange={(e) => updateCustomer('phone', e.target.value)}
                />

                <h3 style={{ marginTop: '10px' }}>
  {t.howReceive}
</h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => updateCustomer('pickupType', 'abholung')}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border:
                        customer.pickupType === 'abholung'
                          ? '2px solid #c93b1f'
                          : '1px solid #ddd4c8',
                      background:
                        customer.pickupType === 'abholung'
                          ? '#fff3ed'
                          : '#fbf8f2',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '15px',
                    }}
                  >
                    {t.pickup}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateCustomer('pickupType', 'lieferung')}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border:
                        customer.pickupType === 'lieferung'
                          ? '2px solid #c93b1f'
                          : '1px solid #ddd4c8',
                      background:
                        customer.pickupType === 'lieferung'
                          ? '#fff3ed'
                          : '#fbf8f2',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '15px',
                    }}
                  >
                    {t.delivery}
                  </button>
                </div>

                {customer.pickupType === 'lieferung' && (
                  <>
                    <input
                      type="text"
                      placeholder={t.street}
                      value={customer.street}
                      onChange={(e) => updateCustomer('street', e.target.value)}
                    />

                    <input
                      type="text"
                     placeholder={t.houseNumber}
                      value={customer.houseNumber}
                      onChange={(e) =>
                        updateCustomer('houseNumber', e.target.value)
                      }
                    />

                    <input
                      type="text"
                      placeholder={t.postalCode}
                      value={customer.postalCode}
                      onChange={(e) =>
                        updateCustomer('postalCode', e.target.value)
                      }
                    />

                    <input
                      type="text"
                      placeholder={t.city}
                      value={customer.city}
                      onChange={(e) => updateCustomer('city', e.target.value)}
                    />

                    <input
                      type="text"
                     placeholder={t.floor}
                      value={customer.floor}
                      onChange={(e) => updateCustomer('floor', e.target.value)}
                    />

                    <input
                      type="text"
                     placeholder={t.deliveryNote}
                      value={customer.deliveryNote}
                      onChange={(e) =>
                        updateCustomer('deliveryNote', e.target.value)
                      }
                    />

                    <div
                      style={{
                        padding: '12px 16px',
                        marginBottom: '16px',
                        borderRadius: '14px',
                        background: '#f3efe8',
                        color: '#5f5a54',
                        fontSize: '14px',
                      }}
                    >
                     🚚 {t.deliveryFee}: {DELIVERY_FEE.toFixed(2).replace('.', ',')} €
                    </div>
                  </>
                )}

                {customer.pickupType === 'abholung' && (
                  <div
                    style={{
                      padding: '14px 16px',
                      marginBottom: '16px',
                      borderRadius: '14px',
                      background: '#f3efe8',
                      color: '#5f5a54',
                      fontSize: '15px',
                    }}
                  >
                    {t.pickupInfo}
                  </div>
                )}

                <input
                  type="text"
                 placeholder={t.desiredTime}
                  value={customer.time}
                  onChange={(e) => updateCustomer('time', e.target.value)}
                />
              </div>

              {/* CART */}
              <div className="cart">
                <div className="cartHeader">
                  <span>{t.yourSelection}</span>
                 <span>
  {totalQuantity} {totalQuantity === 1 ? t.item : t.items}
</span>
                </div>

                {cartItems.map((item) => (
                  <div
                    className="cartRow"
                    key={item.id}
                    style={{ alignItems: 'center', gap: '16px' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', marginBottom: '8px' }}>
                        {item.categoryName} — {item.name}
                      </span>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label={`Weniger ${item.name}`}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            border: '1px solid #d8d0c5',
                            background: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '20px',
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          −
                        </button>

                        <strong style={{ minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </strong>

                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label={`Mehr ${item.name}`}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            border: '1px solid #d8d0c5',
                            background: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '20px',
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <strong style={{ whiteSpace: 'nowrap' }}>
                      {(item.price * item.quantity).toFixed(2).replace('.', ',')} €
                    </strong>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: '18px',
                    marginBottom: '8px',
                    textAlign: 'center',
                  }}
                >
                  <button
                    type="button"
                    onClick={scrollToMenu}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#c93b1f',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '700',
                      padding: '10px 16px',
                    }}
                  >
                     {t.changeOrder}
                  </button>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #ddd4c8',
                    marginTop: '18px',
                    paddingTop: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span>{t.subtotal}</span>
                    <strong>{subtotal.toFixed(2).replace('.', ',')} €</strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span>
  {customer.pickupType === 'lieferung'
    ? t.delivery
    : t.pickup}
</span>
                    <strong>{deliveryFee.toFixed(2).replace('.', ',')} €</strong>
                  </div>

                  <div className="total">
                    <span>{t.total}</span>
                    <strong>{total.toFixed(2).replace('.', ',')} €</strong>
                  </div>
                </div>

                <div className="orderActions">
                  <button
                    type="button"
                    className="whatsappButton"
                    onClick={sendOrder}
                  >
                   {t.sendWhatsApp} →
                  </button>

                  <button
                    type="button"
                    className="whatsappButton"
                    onClick={sendTelegramOrder}
                    style={{
                      background: '#229ED9',
                      marginTop: '10px',
                    }}
                  >
                   {t.sendTelegram} →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* SPECIAL OFFER */}
<section id="special-offer" className="specialOffer">
  <div>
    <p className="eyebrow">WUNDERTEIG</p>
    <h2>{t.specialOfferTitle}</h2>
   <p>{t.specialOfferDescription}</p>
    <a href="#menu" className="specialOfferButton">
     {t.specialOfferButton}
    </a>
  </div>
</section>
      {/* ABOUT */}
      <section id="about" className="darkSection">
        <div>
          <p className="eyebrow light">WUNDERTEIG</p>
          <h2>
            {t.aboutTitle}
<br />
<em>{t.aboutTitleSecond}</em>
          </h2>
        </div>

        <p className="aboutText">
          {t.aboutDescription}
        </p>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact">
       <p className="eyebrow">{t.contact}</p>

        <h2>
        {t.contactTitle}
<br />
{t.contactTitleSecond}
        </h2>

        <div
          className="phoneContact"
          style={{
            marginTop: '35px',
            marginBottom: '35px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '2px',
              marginBottom: '12px',
            }}
          >
            {t.callDirectly}
          </div>

          <a
            href={`tel:${PHONE}`}
            style={{
              display: 'inline-block',
              fontSize: '42px',
              lineHeight: '1.1',
              fontWeight: '800',
              color: 'inherit',
              textDecoration: 'none',
              letterSpacing: '1px',
            }}
          >
            +49 163 708 83 47
          </a>

          <div
            style={{
              marginTop: '10px',
              fontSize: '16px',
              opacity: '0.7',
            }}
          >
            {t.phoneDescription}
          </div>
        </div>

        <div className="actions center">
          <a className="primary" href="#menu">
            {t.viewMenu}
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="logo">
          WUNDER<span>TEIG</span>
        </div>
        <p>© 2026 Wunderteig · Pizzamobil</p>
      </footer>

      {/* FLOATING CART */}
      {cartItems.length > 0 && (
        <button
          type="button"
          className="floatingCart"
          onClick={scrollToCart}
        >
          <span className="floatingCartIcon">🛒</span>

          <span className="floatingCartInfo">
            <strong>{totalQuantity} {totalQuantity === 1 ? t.item : t.items}</strong>
            <small>{t.cart}</small>
          </span>

          <strong className="floatingCartPrice">
            {total.toFixed(2).replace('.', ',')} €
          </strong>
        </button>
      )}
    </main>
  );
}

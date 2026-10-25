import { demoRestaurants } from '../demoOrders';

export default function RestaurantAccountsPage() {
  return <main className="platformPage">
    <header className="platformNav">
      <a className="brand" href="/"><span className="brandMark">O</span><span>OrderPilot<span className="brandLight">Platform</span></span></a>
      <div className="navRight"><span className="demoPill"><i /> RESTAURANT-DEMO · LOKALE DATEN</span><a className="restaurantNavLink" href="/">Kundenansicht ↗</a></div>
    </header>
    <div className="platformContent restaurantDashboard">
      <div className="dashboardTop">
        <div><span className="eyebrow">RESTAURANT-BEREICH · DEMO</span><h1>Restaurant-Konten.</h1><p>Jedes Demo-Restaurant hat einen eigenen Kabinetts-Link und sieht nur seine Bestellungen.</p></div>
      </div>
      <div className="restaurantAccountGrid">
        {demoRestaurants.map((restaurant) => <a className="restaurantAccountCard" href={`/restaurant/${restaurant.id}`} key={restaurant.id}>
          <span className="accountAvatar" style={{ backgroundColor: restaurant.color }}>{restaurant.name.charAt(0)}</span>
          <span className="accountDetails"><strong>{restaurant.name}</strong><small>{restaurant.type} · Demo-Konto</small></span>
          <span className="accountArrow">Konto öffnen →</span>
        </a>)}
      </div>
      <p className="dashboardPrivacy">Diese Links demonstrieren getrennte Restaurantbereiche. Es gibt noch keine Anmeldung oder echte Zugriffskontrolle; Demo-Daten bleiben lokal in diesem Browser.</p>
    </div>
    <footer className="platformFooter"><a className="brand" href="/"><span className="brandMark">O</span><span>OrderPilot<span className="brandLight">Platform</span></span></a><span>Restaurant-Demo</span><a href="/">Zur Kundenansicht ↗</a></footer>
  </main>;
}

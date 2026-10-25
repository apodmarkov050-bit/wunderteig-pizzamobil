export const DEMO_ORDER_STORAGE_KEY = 'orderpilot-platform-demo-orders-v1';
export const DEMO_ORDER_CHANGE_EVENT = 'orderpilot-demo-orders-change';

export const demoRestaurants = [
  { id: 'wunderteig', name: 'Wunderteig Pizzamobil', type: 'Pizza · Italienisch', area: 'Berlin · Prenzlauer Berg', time: '25–35 Min.', rating: '4,9', image: '/pizza-hero.png', color: '#e8efe5', description: 'Pizza aus dem mobilen Holzofen – frisch, direkt und unkompliziert.', menu: 'wunderteig', deliveryFee: 2.5, pickup: true, delivery: true },
  { id: 'green-table', name: 'Green Table', type: 'Bowls · Gesund', area: 'Berlin · Mitte', time: '20–30 Min.', rating: '4,8', image: '/salat-category.jpg', color: '#edf1df', description: 'Saisonale Zutaten und bunte Bowls für jeden Tag.', menu: 'green-table', deliveryFee: 1.9, pickup: true, delivery: true },
  { id: 'pasta-club', name: 'Pasta Club', type: 'Pasta · Italienisch', area: 'Berlin · Friedrichshain', time: '30–40 Min.', rating: '4,7', image: '/pasta-category.jpg', color: '#f4e8d5', description: 'Hausgemachte Pasta, langsam gekochte Saucen.', menu: 'pasta-club', deliveryFee: 3.5, pickup: true, delivery: false },
];

export function readDemoOrders() {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(DEMO_ORDER_STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveDemoOrder(order) {
  const orders = readDemoOrders();
  const next = [order, ...orders.filter((item) => item.id !== order.id)];
  window.localStorage.setItem(DEMO_ORDER_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(DEMO_ORDER_CHANGE_EVENT));
  return next;
}

export function updateDemoOrder(id, updates) {
  const next = readDemoOrders().map((order) => order.id === id ? { ...order, ...updates } : order);
  window.localStorage.setItem(DEMO_ORDER_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(DEMO_ORDER_CHANGE_EVENT));
  return next;
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers },
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Die Bestellung konnte nicht geladen werden.');
  return result;
}

export const ordersRepository = {
  async list(restaurantId, accessCode) {
    const query = new URLSearchParams({ restaurantId });
    const result = await request(`/api/platform/orders?${query}`, {
      headers: { 'x-restaurant-access-code': accessCode },
    });
    return result.orders;
  },

  async getById(id) {
    const result = await request(`/api/platform/orders/${encodeURIComponent(id)}`);
    return result.order;
  },

  async create(order) {
    const result = await request('/api/platform/orders', {
      method: 'POST',
      body: JSON.stringify({ order }),
    });
    return result.order;
  },

  async update(id, changes, accessCode) {
    const result = await request(`/api/platform/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: accessCode ? { 'x-restaurant-access-code': accessCode } : {},
      body: JSON.stringify({ changes }),
    });
    return result.order;
  },
};

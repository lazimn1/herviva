const API_BASE = import.meta.env.VITE_API_URL || '';

export async function createOrder(payload) {
  const res = await fetch(`${API_BASE}/api/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create order');
  return data;
}

export async function verifyPayment(payload) {
  const res = await fetch(`${API_BASE}/api/orders/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Payment verification failed');
  return data;
}

export async function getOrder(orderId) {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Order not found');
  return data;
}

export async function trackOrders(email) {
  const res = await fetch(`${API_BASE}/api/orders/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
  return data;
}

import { API_BASE } from '../../../config/api';

export async function placeOrder(cartItems) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Order failed (${response.status})`);
  }

  return response.json();
}

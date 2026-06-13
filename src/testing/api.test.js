import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMenu, fetchCategories } from '../features/menu/api/menuApi';
import { placeOrder } from '../features/order/api/orderApi';

beforeEach(() => vi.restoreAllMocks());

describe('fetchMenu', () => {
  it('returns menu items on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Burger' }]),
    });

    const result = await fetchMenu();
    expect(result).toEqual([{ id: 1, name: 'Burger' }]);
  });

  it('throws when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });

    await expect(fetchMenu()).rejects.toThrow('Failed to fetch menu items');
  });
});

describe('fetchCategories', () => {
  it('returns categories on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Drinks' }]),
    });

    const result = await fetchCategories();
    expect(result).toEqual([{ id: 1, name: 'Drinks' }]);
  });

  it('throws when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });

    await expect(fetchCategories()).rejects.toThrow('Failed to fetch categories');
  });
});

describe('placeOrder', () => {
  it('sends correct payload and returns order on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 10, totalPrice: 8.99 }),
    });

    const cart = [{ menuItemId: 1, quantity: 2 }];
    const result = await placeOrder(cart);

    expect(result).toEqual({ id: 10, totalPrice: 8.99 });

    const call = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(call[1].body);
    expect(body.items).toEqual([{ menuItemId: 1, quantity: 2 }]);
  });

  it('throws when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad request'),
    });

    await expect(placeOrder([])).rejects.toThrow('Bad request');
  });

  it('throws with status code when body is empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve(''),
    });

    await expect(placeOrder([])).rejects.toThrow('Order failed (500)');
  });
});

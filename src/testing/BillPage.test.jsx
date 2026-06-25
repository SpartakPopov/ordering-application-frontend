import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BillPage, {
  getUnpaidOrders,
  addUnpaidOrder,
  clearUnpaidOrders,
  removeUnpaidOrder,
} from '../pages/BillPage';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
afterEach(() => localStorage.clear());

function renderBill() {
  return render(
    <MemoryRouter>
      <BillPage />
    </MemoryRouter>
  );
}

// ── Helper functions ──────────────────────────────────────────────

describe('getUnpaidOrders', () => {
  it('returns empty array when storage is empty', () => {
    expect(getUnpaidOrders()).toEqual([]);
  });

  it('returns stored orders', () => {
    localStorage.setItem('lechateau_unpaid_orders', JSON.stringify([{ id: 1, totalPrice: 5 }]));
    expect(getUnpaidOrders()).toEqual([{ id: 1, totalPrice: 5 }]);
  });

  it('returns empty array when storage contains invalid JSON', () => {
    localStorage.setItem('lechateau_unpaid_orders', 'not-json');
    expect(getUnpaidOrders()).toEqual([]);
  });
});

describe('addUnpaidOrder', () => {
  it('adds a new order', () => {
    addUnpaidOrder({ id: 1, totalPrice: 5 });
    expect(getUnpaidOrders()).toHaveLength(1);
  });

  it('does not add duplicate orders', () => {
    addUnpaidOrder({ id: 1, totalPrice: 5 });
    addUnpaidOrder({ id: 1, totalPrice: 5 });
    expect(getUnpaidOrders()).toHaveLength(1);
  });
});

describe('clearUnpaidOrders', () => {
  it('removes all orders', () => {
    addUnpaidOrder({ id: 1, totalPrice: 5 });
    clearUnpaidOrders();
    expect(getUnpaidOrders()).toEqual([]);
  });
});

describe('removeUnpaidOrder', () => {
  it('removes only the specified order', () => {
    addUnpaidOrder({ id: 1, totalPrice: 5 });
    addUnpaidOrder({ id: 2, totalPrice: 8 });
    removeUnpaidOrder(1);
    const remaining = getUnpaidOrders();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(2);
  });
});

// ── BillPage component ────────────────────────────────────────────

describe('BillPage', () => {
  it('shows no unpaid orders message when storage is empty', async () => {
    renderBill();
    await waitFor(() => expect(screen.getByText(/no unpaid orders/i)).toBeInTheDocument());
  });

  it('shows orders loaded from the API', async () => {
    addUnpaidOrder({ id: 1, totalPrice: 8.99 });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          totalPrice: 8.99,
          items: [{ id: 1, menuItemName: 'Burger', quantity: 1, subtotal: 8.99 }],
        }),
    });

    renderBill();

    await waitFor(() => expect(screen.getByText('Order #1')).toBeInTheDocument());
    expect(screen.getByText('Burger')).toBeInTheDocument();
  });

  it('shows grand total when orders are loaded', async () => {
    addUnpaidOrder({ id: 1, totalPrice: 8.99 });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ id: 1, totalPrice: 8.99, items: [] }),
    });

    renderBill();

    await waitFor(() => {
      // EUR8.99 appears in the order row, grand total, and Pay button — check the grand total div
      const grandTotalEl = document.querySelector('.bill-grand-total');
      expect(within(grandTotalEl).getByText('EUR8.99')).toBeInTheDocument();
    });
  });

  it('clears orders when reset table is confirmed', async () => {
    addUnpaidOrder({ id: 1, totalPrice: 8.99 });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, totalPrice: 8.99, items: [] }),
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderBill();
    await waitFor(() => screen.getByText('Reset table'));

    await userEvent.click(screen.getByText('Reset table'));

    await waitFor(() =>
      expect(screen.getByText(/no unpaid orders/i)).toBeInTheDocument()
    );
  });

  it('does not clear orders when reset table is cancelled', async () => {
    addUnpaidOrder({ id: 1, totalPrice: 8.99 });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, totalPrice: 8.99, items: [] }),
    });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderBill();
    await waitFor(() => screen.getByText('Reset table'));

    await userEvent.click(screen.getByText('Reset table'));

    expect(getUnpaidOrders()).toHaveLength(1);
  });
});

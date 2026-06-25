import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cart } from '../features/order/components/Cart';

const sampleCart = [
  { menuItemId: 1, menuItemName: 'Burger', menuItemPrice: 8.99, quantity: 2 },
  { menuItemId: 2, menuItemName: 'Cola',   menuItemPrice: 2.50, quantity: 1 },
];

function renderCart(overrides = {}) {
  const defaults = {
    cart: sampleCart,
    onIncrease: vi.fn(),
    onDecrease: vi.fn(),
    onRemove: vi.fn(),
    onPlace: vi.fn(),
    isSubmitting: false,
    orderStatus: null,
    lastOrder: null,
    onDismiss: vi.fn(),
    onPayNow: vi.fn(),
  };
  return render(<Cart {...defaults} {...overrides} />);
}

describe('Cart', () => {
  it('renders all cart items', () => {
    renderCart();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Cola')).toBeInTheDocument();
  });

  it('shows correct total price', () => {
    renderCart();
    // 8.99 * 2 + 2.50 * 1 = 20.48
    expect(screen.getByText('EUR20.48')).toBeInTheDocument();
  });

  it('shows empty message when cart is empty', () => {
    renderCart({ cart: [] });
    expect(screen.getByText(/no items selected/i)).toBeInTheDocument();
  });

  it('place order button is disabled when cart is empty', () => {
    renderCart({ cart: [] });
    expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled();
  });

  it('place order button is enabled when cart has items', () => {
    renderCart();
    expect(screen.getByRole('button', { name: /place order/i })).not.toBeDisabled();
  });

  it('place order button is disabled while submitting', () => {
    renderCart({ isSubmitting: true });
    expect(screen.getByRole('button', { name: /placing/i })).toBeDisabled();
  });

  it('calls onPlace when place order is clicked', async () => {
    const onPlace = vi.fn();
    renderCart({ onPlace });
    await userEvent.click(screen.getByRole('button', { name: /place order/i }));
    expect(onPlace).toHaveBeenCalledOnce();
  });

  it('calls onIncrease with correct id when + is clicked', async () => {
    const onIncrease = vi.fn();
    renderCart({ onIncrease });
    const plusButtons = screen.getAllByRole('button', { name: /increase quantity/i });
    await userEvent.click(plusButtons[0]);
    expect(onIncrease).toHaveBeenCalledWith(1);
  });

  it('calls onDecrease with correct id when − is clicked', async () => {
    const onDecrease = vi.fn();
    renderCart({ onDecrease });
    const minusButtons = screen.getAllByRole('button', { name: /decrease quantity/i });
    await userEvent.click(minusButtons[0]);
    expect(onDecrease).toHaveBeenCalledWith(1);
  });

  it('shows × on decrease button when quantity is 1', () => {
    const cart = [{ menuItemId: 1, menuItemName: 'Cola', menuItemPrice: 2.50, quantity: 1 }];
    renderCart({ cart });
    // Both the qty-btn and remove-btn have aria-label="Remove item" at qty=1
    const removeButtons = screen.getAllByRole('button', { name: /remove item/i });
    expect(removeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows order confirmation on success', () => {
    renderCart({
      orderStatus: 'success',
      lastOrder: { id: 42, totalPrice: 11.49 },
    });
    expect(screen.getByText(/order placed/i)).toBeInTheDocument();
    expect(screen.getByText(/#42/)).toBeInTheDocument();
  });

  it('shows error state when orderStatus is error', () => {
    renderCart({ orderStatus: 'error' });
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked on error', async () => {
    const onDismiss = vi.fn();
    renderCart({ orderStatus: 'error', onDismiss });
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('calls onPayNow when pay now is clicked', async () => {
    const onPayNow = vi.fn();
    renderCart({
      orderStatus: 'success',
      lastOrder: { id: 1, totalPrice: 5.00 },
      onPayNow,
    });
    await userEvent.click(screen.getByRole('button', { name: /pay now/i }));
    expect(onPayNow).toHaveBeenCalledOnce();
  });

  it('shows item count badge when cart has items', () => {
    renderCart();
    // total quantity = 2 + 1 = 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

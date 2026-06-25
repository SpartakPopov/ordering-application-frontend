import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CheckoutCompletePage from '../pages/CheckoutCompletePage';
import { addUnpaidOrder, getUnpaidOrders } from '../pages/BillPage';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

function renderComplete(state = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/complete', state }]}>
      <Routes>
        <Route path="/complete" element={<CheckoutCompletePage />} />
        <Route path="/" element={<div>Menu Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CheckoutCompletePage', () => {
  it('shows Payment Successful heading', () => {
    renderComplete({ totalPrice: 12.50 });
    expect(screen.getByText('Payment Successful')).toBeInTheDocument();
  });

  it('shows the amount paid', () => {
    renderComplete({ totalPrice: 12.50 });
    expect(screen.getByText('EUR12.50 paid')).toBeInTheDocument();
  });

  it('clears unpaid orders when totalPrice is present', async () => {
    addUnpaidOrder({ id: 1, totalPrice: 12.50 });
    renderComplete({ totalPrice: 12.50 });
    await waitFor(() => expect(getUnpaidOrders()).toHaveLength(0));
  });

  it('does not clear unpaid orders when arriving without state', () => {
    addUnpaidOrder({ id: 1, totalPrice: 12.50 });
    renderComplete();
    expect(getUnpaidOrders()).toHaveLength(1);
  });

  it('navigates back to menu when button is clicked', async () => {
    renderComplete({ totalPrice: 5.00 });
    await userEvent.click(screen.getByRole('button', { name: /back to menu/i }));
    expect(screen.getByText('Menu Page')).toBeInTheDocument();
  });

  it('does not show total when no state is provided', () => {
    renderComplete();
    expect(screen.queryByText(/paid/i)).not.toBeInTheDocument();
  });
});

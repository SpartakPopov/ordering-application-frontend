import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryNav } from '../features/menu/components/CategoryNav';
import { TopNav } from '../features/menu/components/TopNav';
import { MemoryRouter } from 'react-router-dom';
import { clearUnpaidOrders, addUnpaidOrder } from '../pages/BillPage';

const mockCategories = [
  { id: 1, name: 'Drinks' },
  { id: 2, name: 'Food' },
];

describe('CategoryNav', () => {
  it('renders ALL button', () => {
    render(<CategoryNav categories={mockCategories} activeCategory={null} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'ALL' })).toBeInTheDocument();
  });

  it('renders a button for each category', () => {
    render(<CategoryNav categories={mockCategories} activeCategory={null} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'DRINKS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FOOD' })).toBeInTheDocument();
  });

  it('calls onSelect with null when ALL is clicked', async () => {
    const onSelect = vi.fn();
    render(<CategoryNav categories={mockCategories} activeCategory={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'ALL' }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('calls onSelect with category id when a category is clicked', async () => {
    const onSelect = vi.fn();
    render(<CategoryNav categories={mockCategories} activeCategory={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'DRINKS' }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});

describe('TopNav', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('renders the brand name', () => {
    render(<MemoryRouter><TopNav /></MemoryRouter>);
    expect(screen.getByText('Le Château')).toBeInTheDocument();
  });

  it('shows no badge when there are no unpaid orders', () => {
    render(<MemoryRouter><TopNav /></MemoryRouter>);
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it('shows badge count when there are unpaid orders', () => {
    addUnpaidOrder({ id: 1, totalPrice: 5 });
    addUnpaidOrder({ id: 2, totalPrice: 8 });
    render(<MemoryRouter><TopNav /></MemoryRouter>);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('updates badge count when unpaid orders change', () => {
    render(<MemoryRouter><TopNav /></MemoryRouter>);
    act(() => {
      addUnpaidOrder({ id: 1, totalPrice: 5 });
    });
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuCard } from '../features/menu/components/MenuCard';

const sampleItem = {
  id: 1,
  name: 'Croissant',
  description: 'Buttery and flaky',
  price: 4.5,
  imageUrl: null,
};

function renderCard(overrides = {}) {
  return render(
    <MenuCard
      item={sampleItem}
      categoryName="Pastries"
      index={0}
      onAdd={vi.fn()}
      cartQuantity={0}
      {...overrides}
    />
  );
}

describe('MenuCard', () => {
  it('renders item name', () => {
    renderCard();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
  });

  it('renders item description', () => {
    renderCard();
    expect(screen.getByText('Buttery and flaky')).toBeInTheDocument();
  });

  it('renders formatted price', () => {
    renderCard();
    expect(screen.getByText('EUR4.50')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    renderCard();
    expect(screen.getByText('Pastries')).toBeInTheDocument();
  });

  it('shows ADD button when not in cart', () => {
    renderCard({ cartQuantity: 0 });
    expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument();
  });

  it('shows ADD MORE button when already in cart', () => {
    renderCard({ cartQuantity: 2 });
    expect(screen.getByRole('button', { name: /add more/i })).toBeInTheDocument();
  });

  it('shows quantity badge when item is in cart', () => {
    renderCard({ cartQuantity: 3 });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not show quantity badge when not in cart', () => {
    renderCard({ cartQuantity: 0 });
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('calls onAdd with the item when ADD is clicked', async () => {
    const onAdd = vi.fn();
    renderCard({ onAdd });
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(onAdd).toHaveBeenCalledWith(sampleItem);
  });

  it('renders image when imageUrl is provided', () => {
    renderCard({ item: { ...sampleItem, imageUrl: 'https://example.com/img.jpg' } });
    expect(screen.getByRole('img', { name: 'Croissant' })).toBeInTheDocument();
  });

  it('renders placeholder when imageUrl is null', () => {
    renderCard({ item: { ...sampleItem, imageUrl: null } });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not render description when missing', () => {
    renderCard({ item: { ...sampleItem, description: undefined } });
    expect(screen.queryByText('Buttery and flaky')).not.toBeInTheDocument();
  });
});

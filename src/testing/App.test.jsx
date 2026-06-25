import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import App from '../app/App';
import { AuthProvider } from '../context/AuthContext';

// Wrap App in the same providers that main.jsx provides in production
function renderApp() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
}

const mockMenu = [
  { id: 1, name: 'Croissant', description: 'Buttery and flaky', price: 4, categoryId: 1, imageUrl: null },
  { id: 2, name: 'Baguette', description: 'Classic French bread', price: 3, categoryId: 2, imageUrl: null },
];

const mockCategories = [
  { id: 1, name: 'Pastries' },
  { id: 2, name: 'Bread' },
];

//resets mocks before tests
beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(menu = mockMenu, categories = mockCategories) {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
    const data = url.includes('categories') ? categories : menu;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    });
  });
}

function getCategoryNav() {
  return screen.getByRole('navigation');
}



describe('App', () => {
  it('shows loading state initially', () => {
    mockFetch();
    renderApp();
    expect(screen.getByText(/loading menu/i)).toBeInTheDocument();
  });




  it('renders menu items after loading', async () => {
    mockFetch();
    renderApp();
    await waitFor(() => expect(screen.getByText('Croissant')).toBeInTheDocument());
    expect(screen.getByText('Baguette')).toBeInTheDocument();
  });




  it('renders category filter buttons', async () => {
    mockFetch();
    renderApp();
    await waitFor(() => expect(within(getCategoryNav()).getByText('PASTRIES')).toBeInTheDocument());
    expect(within(getCategoryNav()).getByText('BREAD')).toBeInTheDocument();
    expect(within(getCategoryNav()).getByText('ALL')).toBeInTheDocument();
  });




  it('filters items by category when a filter button is clicked', async () => {
    mockFetch();
    renderApp();
    await waitFor(() => expect(within(getCategoryNav()).getByText('PASTRIES')).toBeInTheDocument());

    await userEvent.click(within(getCategoryNav()).getByText('PASTRIES'));

    expect(screen.getByText('Croissant')).toBeInTheDocument();
    expect(screen.queryByText('Baguette')).not.toBeInTheDocument();
  });




  it('shows all items when ALL is clicked after filtering', async () => {
    mockFetch();
    renderApp();
    await waitFor(() => expect(within(getCategoryNav()).getByText('PASTRIES')).toBeInTheDocument());

    await userEvent.click(within(getCategoryNav()).getByText('PASTRIES'));
    await userEvent.click(within(getCategoryNav()).getByText('ALL'));

    expect(screen.getByText('Croissant')).toBeInTheDocument();
    expect(screen.getByText('Baguette')).toBeInTheDocument();
  });



  it('shows error message when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });
    renderApp();
    await waitFor(() => expect(screen.getByText(/connection failed/i)).toBeInTheDocument());
  });




  it('displays item prices', async () => {
    mockFetch();
    renderApp();
    await waitFor(() => expect(screen.getByText('EUR4.00')).toBeInTheDocument());
    expect(screen.getByText('EUR3.00')).toBeInTheDocument();
  });




  it('shows empty state when no items exist', async () => {
    mockFetch([], mockCategories);
    renderApp();
    await waitFor(() => expect(screen.getByText(/no items in this category/i)).toBeInTheDocument());
  });
});

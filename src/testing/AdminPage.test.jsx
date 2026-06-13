import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import AdminPage from '../pages/AdminPage';

const mockCategories = [{ id: 1, name: 'Drinks' }, { id: 2, name: 'Food' }];
const mockItems = [
  { id: 1, name: 'Burger', price: 8.99, categoryId: 2, imageUrl: null },
];

function mockFetch(items = mockItems, categories = mockCategories) {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
    if (url.includes('/api/categories')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(categories) });
    }
    if (url.includes('/api/menu')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(items) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

function renderAdmin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  // jsdom doesn't implement scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('AdminPage', () => {
  it('renders the Add Menu Item form on load', async () => {
    mockFetch();
    renderAdmin();
    await waitFor(() => expect(screen.getByText('Add Menu Item')).toBeInTheDocument());
  });

  it('renders existing menu items in the table', async () => {
    mockFetch();
    renderAdmin();
    await waitFor(() => expect(screen.getByText('Burger')).toBeInTheDocument());
  });

  it('shows item count in section heading', async () => {
    mockFetch();
    renderAdmin();
    await waitFor(() => expect(screen.getByText(/current menu \(1 item/i)).toBeInTheDocument());
  });

  it('populates form when Edit is clicked', async () => {
    mockFetch();
    renderAdmin();
    await waitFor(() => screen.getByText('Burger'));

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByText('Edit Menu Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Burger')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8.99')).toBeInTheDocument();
  });

  it('shows Cancel button in edit mode', async () => {
    mockFetch();
    renderAdmin();
    await waitFor(() => screen.getByText('Burger'));

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('exits edit mode when Cancel is clicked', async () => {
    mockFetch();
    renderAdmin();
    await waitFor(() => screen.getByText('Burger'));

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByText('Add Menu Item')).toBeInTheDocument();
  });

  it('shows empty state when no items exist', async () => {
    mockFetch([]);
    renderAdmin();
    await waitFor(() => expect(screen.getByText(/no items yet/i)).toBeInTheDocument());
  });

  it('shows validation error when form is submitted empty', async () => {
    mockFetch();
    renderAdmin();
    await waitFor(() => screen.getByText('Add Menu Item'));

    // userEvent respects HTML constraint validation; use fireEvent to bypass it
    const form = document.querySelector('.admin-form');
    fireEvent.submit(form);

    await waitFor(() =>
      expect(screen.getByText(/name, price and category are required/i)).toBeInTheDocument()
    );
  });

  it('adds new item to the list on successful POST', async () => {
    const newItem = { id: 2, name: 'Cola', price: 2.50, categoryId: 1, imageUrl: null };

    vi.spyOn(globalThis, 'fetch').mockImplementation((url, opts) => {
      if (url.includes('/api/categories')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) });
      if (opts?.method === 'POST') return Promise.resolve({ ok: true, json: () => Promise.resolve(newItem) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockItems) });
    });

    renderAdmin();
    await waitFor(() => screen.getByText('Add Menu Item'));

    await userEvent.type(screen.getByPlaceholderText(/e.g. croissant/i), 'Cola');
    await userEvent.type(screen.getByPlaceholderText(/e.g. 3.50/i), '2.50');
    await userEvent.click(screen.getByRole('button', { name: /add to menu/i }));

    await waitFor(() => expect(screen.getByText(/"Cola" added to the menu/i)).toBeInTheDocument());
  });

  it('removes item from list when Delete is confirmed', async () => {
    mockFetch();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    vi.spyOn(globalThis, 'fetch').mockImplementation((url, opts) => {
      if (url.includes('/api/categories')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) });
      if (opts?.method === 'DELETE') return Promise.resolve({ ok: true });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockItems) });
    });

    renderAdmin();
    await waitFor(() => screen.getByText('Burger'));

    await userEvent.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() => expect(screen.queryByText('Burger')).not.toBeInTheDocument());
  });
});

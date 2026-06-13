import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../context/AuthContext';

// A minimal component that exposes the auth context values for testing
function TestConsumer() {
  const { token, role, login, logout, authHeader } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="role">{role ?? 'null'}</span>
      <span data-testid="header">{JSON.stringify(authHeader())}</span>
      <button onClick={() => login('eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9NQU5BR0VSIn0.sig')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => sessionStorage.clear());
afterEach(() => sessionStorage.clear());

describe('AuthContext', () => {
  it('starts with no token when sessionStorage is empty', () => {
    renderWithAuth();
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('null');
  });

  it('login stores token and parses role', async () => {
    renderWithAuth();
    await userEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('token').textContent).not.toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('ROLE_MANAGER');
  });

  it('login writes token to sessionStorage', async () => {
    renderWithAuth();
    await userEvent.click(screen.getByText('Login'));
    expect(sessionStorage.getItem('auth_token')).not.toBeNull();
  });

  it('logout clears token and role', async () => {
    renderWithAuth();
    await userEvent.click(screen.getByText('Login'));
    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('null');
  });

  it('logout removes token from sessionStorage', async () => {
    renderWithAuth();
    await userEvent.click(screen.getByText('Login'));
    await userEvent.click(screen.getByText('Logout'));
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('authHeader returns Authorization header when logged in', async () => {
    renderWithAuth();
    await userEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('header').textContent).toContain('Authorization');
    expect(screen.getByTestId('header').textContent).toContain('Bearer');
  });

  it('authHeader returns empty object when not logged in', () => {
    renderWithAuth();
    expect(screen.getByTestId('header').textContent).toBe('{}');
  });

  it('reads existing token from sessionStorage on mount', () => {
    sessionStorage.setItem(
      'auth_token',
      'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9LSVRDSEVOIn0.sig'
    );
    renderWithAuth();
    expect(screen.getByTestId('token').textContent).not.toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('ROLE_KITCHEN');
  });
});

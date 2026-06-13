import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';

function renderRoute({ token = null, role = null, allowedRoles = undefined } = {}) {
  if (token) {
    sessionStorage.setItem('auth_token', token);
  } else {
    sessionStorage.clear();
  }

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute allowedRoles={allowedRoles}>
                <div>Protected Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

// A fake manager JWT — header.payload.sig where payload has role=ROLE_MANAGER
const MANAGER_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ role: 'ROLE_MANAGER' })) +
  '.sig';

const KITCHEN_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ role: 'ROLE_KITCHEN' })) +
  '.sig';

describe('PrivateRoute', () => {
  it('redirects to login when not authenticated', () => {
    renderRoute();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated with no role restriction', () => {
    renderRoute({ token: MANAGER_TOKEN });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when role matches allowedRoles', () => {
    renderRoute({ token: MANAGER_TOKEN, allowedRoles: ['ROLE_MANAGER'] });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when role is not in allowedRoles', () => {
    renderRoute({ token: KITCHEN_TOKEN, allowedRoles: ['ROLE_MANAGER'] });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when role is in a multi-role allowedRoles list', () => {
    renderRoute({ token: KITCHEN_TOKEN, allowedRoles: ['ROLE_MANAGER', 'ROLE_KITCHEN'] });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './app/App';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const KitchenPage          = lazy(() => import('./pages/KitchenPage'));
const AdminPage            = lazy(() => import('./pages/AdminPage'));
const LoginPage            = lazy(() => import('./pages/LoginPage'));
const CheckoutPage         = lazy(() => import('./pages/CheckoutPage'));
const CheckoutCompletePage = lazy(() => import('./pages/CheckoutCompletePage'));
const BillPage             = lazy(() => import('./pages/BillPage'));

const fallback = (bg = '#0a0a0a') => (
  <div style={{ background: bg, minHeight: '100vh' }} />
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />

          <Route
            path="/login"
            element={
              <Suspense fallback={fallback()}>
                <LoginPage />
              </Suspense>
            }
          />

          <Route
            path="/admin"
            element={
              <Suspense fallback={fallback()}>
                <PrivateRoute allowedRoles={['ROLE_MANAGER']}>
                  <AdminPage />
                </PrivateRoute>
              </Suspense>
            }
          />

          <Route
            path="/kitchen"
            element={
              <Suspense fallback={fallback('#000')}>
                <PrivateRoute allowedRoles={['ROLE_KITCHEN', 'ROLE_MANAGER']}>
                  <KitchenPage />
                </PrivateRoute>
              </Suspense>
            }
          />

          <Route
            path="/bill"
            element={
              <Suspense fallback={fallback()}>
                <BillPage />
              </Suspense>
            }
          />

          <Route
            path="/checkout"
            element={
              <Suspense fallback={fallback()}>
                <CheckoutPage />
              </Suspense>
            }
          />

          <Route
            path="/checkout/complete"
            element={
              <Suspense fallback={fallback()}>
                <CheckoutCompletePage />
              </Suspense>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

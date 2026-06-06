import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './app/App';

const KitchenPage = lazy(() => import('./pages/KitchenPage'));
const AdminPage   = lazy(() => import('./pages/AdminPage'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div style={{ background: '#0a0a0a', minHeight: '100vh' }} />}>
              <AdminPage />
            </Suspense>
          }
        />
        <Route
          path="/kitchen"
          element={
            <Suspense fallback={<div style={{ background: '#000', minHeight: '100vh' }} />}>
              <KitchenPage />
            </Suspense>
          }
        />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);

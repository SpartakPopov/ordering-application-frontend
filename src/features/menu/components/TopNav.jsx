import { useState, useEffect } from 'react';
import { getUnpaidOrders } from '../../../pages/BillPage';

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const BillIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="9" y1="15" x2="13" y2="15" />
  </svg>
);

export function TopNav() {
  const [unpaidCount, setUnpaidCount] = useState(getUnpaidOrders().length);

  useEffect(() => {
    function onStorageChange() {
      setUnpaidCount(getUnpaidOrders().length);
    }
    // fires when any tab changes localStorage
    window.addEventListener('storage', onStorageChange);
    // fires when this tab changes it (via addUnpaidOrder / clearUnpaidOrders)
    window.addEventListener('unpaid-orders-changed', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('unpaid-orders-changed', onStorageChange);
    };
  }, []);

  return (
    <header className="top-nav">
      <div className="top-nav-left" />
      <div className="brand">
        <h1 className="brand-name">Le Château</h1>
        <p className="brand-tagline">PARIS · DELIVERED</p>
      </div>
      <div className="top-nav-icons">
        <a href="/admin" className="icon-btn" aria-label="Account"><UserIcon /></a>
        <a href="/bill" className="icon-btn icon-btn--badge" aria-label="Bill">
          <BillIcon />
          {unpaidCount > 0 && (
            <span className="nav-badge">{unpaidCount}</span>
          )}
        </a>
      </div>
    </header>
  );
}

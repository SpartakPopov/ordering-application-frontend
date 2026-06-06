const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

export function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav-left" />
      <div className="brand">
        <h1 className="brand-name">Le Château</h1>
        <p className="brand-tagline">PARIS · DELIVERED</p>
      </div>
      <div className="top-nav-icons">
        <a href="/admin" className="icon-btn" aria-label="Account"><UserIcon /></a>
        <button className="icon-btn" aria-label="Cart"><CartIcon /></button>
      </div>
    </header>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BillPage.css';

const STORAGE_KEY = 'lechateau_unpaid_orders';

export function getUnpaidOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addUnpaidOrder(order) {
  const existing = getUnpaidOrders();
  if (existing.find((o) => o.id === order.id)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, { id: order.id, totalPrice: order.totalPrice }]));
  window.dispatchEvent(new Event('unpaid-orders-changed'));
}

export function clearUnpaidOrders() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('unpaid-orders-changed'));
}

export function removeUnpaidOrder(orderId) {
  const updated = getUnpaidOrders().filter((o) => o.id !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('unpaid-orders-changed'));
}

export default function BillPage() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  function loadOrders() {
    const stored = getUnpaidOrders();
    if (stored.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    Promise.all(
      stored.map((o) =>
        fetch(`/api/orders/${o.id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      setOrders(results.filter(Boolean));
      setLoading(false);
    });
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function handleResetTable() {
    if (!window.confirm('Clear all unpaid orders from this table? This cannot be undone.')) return;
    clearUnpaidOrders();
    setOrders([]);
  }

  function handlePayAll() {
    const total = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    navigate('/checkout', { state: { totalPrice: total, orderId: null, multiOrder: true } });
  }

  const grandTotal = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="bill-page">
      <div className="bill-card">
        <div className="bill-header">
          <button className="bill-back-btn" onClick={() => navigate('/')}>← Back to menu</button>
          <h1 className="bill-title">Your Bill</h1>
        </div>

        {loading ? (
          <p className="bill-empty">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="bill-empty">No unpaid orders.</p>
        ) : (
          <>
            <div className="bill-orders">
              {orders.map((order) => (
                <div key={order.id} className="bill-order">
                  <div className="bill-order-header">
                    <span className="bill-order-id">Order #{order.id}</span>
                    <span className="bill-order-total">€{order.totalPrice?.toFixed(2)}</span>
                  </div>
                  <ul className="bill-items">
                    {order.items?.map((item) => (
                      <li key={item.id} className="bill-item">
                        <span>{item.menuItemName}</span>
                        <span>×{item.quantity} · €{item.subtotal?.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bill-footer">
              <div className="bill-grand-total">
                <span>Grand total</span>
                <span>€{grandTotal.toFixed(2)}</span>
              </div>
              <button className="bill-pay-all-btn" onClick={handlePayAll}>
                Pay — €{grandTotal.toFixed(2)}
              </button>
              <button className="bill-reset-btn" onClick={handleResetTable}>
                Reset table
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

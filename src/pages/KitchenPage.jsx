import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import './KitchenPage.css';

// ── Live clock shown in the header ──────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="kitchen-clock">
      <span className="kitchen-clock-time">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <span className="kitchen-clock-date">
        {time.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
      </span>
    </div>
  );
}

// ── Elapsed time badge — re-renders every minute ─────────────────────────────
function ElapsedBadge({ orderedAt }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor((Date.now() - orderedAt) / 60_000);
  const urgent = mins >= 10;
  return (
    <span className={`ticket-elapsed${urgent ? ' ticket-elapsed--urgent' : ''}`}>
      {mins === 0 ? 'just now' : `${mins} min ago`}
    </span>
  );
}

export default function KitchenPage() {
  const { authHeader, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Tracks when each order was first seen on this client (orderId → timestamp ms)
  const orderTimesRef = useRef(new Map());

  const setOrdersRef = useRef(setOrders);
  setOrdersRef.current = setOrders;

  function updateItemStatus(orderId, itemId, status) {
    setOrdersRef.current((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: order.items.map((item) =>
            item.id === itemId ? { ...item, status } : item
          ),
        };
      })
    );
  }

  function handleKitchenMessage(data) {
    switch (data.type) {
      case 'NEW_ORDER':
        orderTimesRef.current.set(data.payload.id, Date.now());
        setOrdersRef.current((prev) => [...prev, data.payload]);
        break;

      case 'ITEM_IN_PROGRESS':
        updateItemStatus(data.payload.orderId, data.payload.item.id, 'IN_PROGRESS');
        break;

      case 'ITEM_DONE':
        updateItemStatus(data.payload.orderId, data.payload.item.id, 'DONE');
        break;

      case 'ORDER_COMPLETED':
        setOrdersRef.current((prev) =>
          prev.filter((o) => o.id !== data.payload.orderId)
        );
        break;
    }
  }

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        const active = data
          .filter((o) => o.status !== 'COMPLETED')
          .sort((a, b) => a.id - b.id);
        // Record arrival time for pre-existing orders
        const now = Date.now();
        active.forEach((o) => {
          if (!orderTimesRef.current.has(o.id)) {
            orderTimesRef.current.set(o.id, now);
          }
        });
        setOrders(active);
      })
      .catch(console.error);

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onDisconnect: () => setConnected(false),
    });

    client.onConnect = () => {
      setConnected(true);
      client.subscribe('/topic/kitchen', (message) => {
        handleKitchenMessage(JSON.parse(message.body));
      });
    };

    client.activate();
    return () => client.deactivate();
  }, []);

  async function startItem(orderId, itemId) {
    try {
      const res = await fetch(`/api/orders/${orderId}/items/${itemId}/start`, {
        method: 'PATCH',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
    } catch {
      setActionError('Failed to start item — please try again.');
    }
  }

  async function markItemDone(orderId, itemId) {
    try {
      const res = await fetch(`/api/orders/${orderId}/items/${itemId}/done`, {
        method: 'PATCH',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
    } catch {
      setActionError('Failed to mark item done — please try again.');
    }
  }

  const newTickets = orders
    .flatMap((o) =>
      o.items
        .filter((item) => !item.status || item.status === 'PENDING')
        .map((item) => ({
          ...item,
          orderId: o.id,
          orderedAt: orderTimesRef.current.get(o.id) ?? Date.now(),
        }))
    )
    .sort((a, b) => a.id - b.id);

  const progressTickets = orders
    .flatMap((o) =>
      o.items
        .filter((item) => item.status === 'IN_PROGRESS')
        .map((item) => ({
          ...item,
          orderId: o.id,
          orderedAt: orderTimesRef.current.get(o.id) ?? Date.now(),
        }))
    )
    .sort((a, b) => a.id - b.id);

  return (
    <div className="kitchen-page">
      <header className="kitchen-header">
        <div className="kitchen-header-left">
          <Clock />
        </div>
        <div className="kitchen-brand">
          <span className="kitchen-brand-name">Le Château</span>
          <span className="kitchen-brand-sub">Kitchen Display</span>
        </div>
        <div className="kitchen-header-right">
          <div className={`connection-status ${connected ? 'connection-status--live' : ''}`}>
            <span className="connection-dot" />
            {connected ? 'Live' : 'Disconnected'}
          </div>
          <button
            className="kitchen-logout-btn"
            onClick={() => { logout(); navigate('/login'); }}
          >
            Log out
          </button>
        </div>
      </header>

      {actionError && (
        <div className="kitchen-error-banner">
          {actionError}
          <button className="kitchen-error-dismiss" onClick={() => setActionError(null)}>✕</button>
        </div>
      )}

      <div className="kitchen-board">
        {/* ── LEFT: New Orders ── */}
        <div className="kitchen-column">
          <div className="column-header">
            <h2 className="column-title column-title--new">New Orders</h2>
            {newTickets.length > 0 && (
              <span className="column-count column-count--new">{newTickets.length}</span>
            )}
          </div>

          {newTickets.length === 0 ? (
            <p className="kitchen-empty">No new orders — standing by.</p>
          ) : (
            <div className="ticket-list">
              {newTickets.map((ticket) => (
                <ItemTicket
                  key={ticket.id}
                  ticket={ticket}
                  onStart={() => startItem(ticket.orderId, ticket.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="kitchen-divider" />

        {/* ── RIGHT: In Progress ── */}
        <div className="kitchen-column">
          <div className="column-header">
            <h2 className="column-title column-title--progress">In Progress</h2>
            {progressTickets.length > 0 && (
              <span className="column-count column-count--progress">{progressTickets.length}</span>
            )}
          </div>

          {progressTickets.length === 0 ? (
            <p className="kitchen-empty">Nothing cooking yet.</p>
          ) : (
            <div className="ticket-list">
              {progressTickets.map((ticket) => (
                <ItemTicket
                  key={ticket.id}
                  ticket={ticket}
                  onDone={() => markItemDone(ticket.orderId, ticket.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemTicket({ ticket, onStart, onDone }) {
  return (
    <div className="ticket">
      <div className="ticket-body">
        <div className="ticket-main">
          <span className="ticket-name">{ticket.menuItemName}</span>
          <span className="ticket-qty">× {ticket.quantity}</span>
        </div>
        <div className="ticket-meta">
          <span className="ticket-order-id">#{ticket.orderId}</span>
          <ElapsedBadge orderedAt={ticket.orderedAt} />
        </div>
      </div>
      <div className="ticket-action">
        {onStart && (
          <button className="start-btn" onClick={onStart}>Start →</button>
        )}
        {onDone && (
          <button className="mark-done-btn" onClick={onDone}>Done</button>
        )}
      </div>
    </div>
  );
}

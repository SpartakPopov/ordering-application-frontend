import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import './KitchenPage.css';

export default function KitchenPage() {
  const { authHeader, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);

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
    switch (data.type) {  // checking the type of message received
      case 'NEW_ORDER':
        setOrdersRef.current((prev) => [...prev, data.payload]); // adds new order to the bottom of the list
        break;

      case 'ITEM_IN_PROGRESS':
        updateItemStatus(data.payload.orderId, data.payload.item.id, 'IN_PROGRESS');
        break;

      case 'ITEM_DONE':
        updateItemStatus(data.payload.orderId, data.payload.item.id, 'DONE');
        break;

      case 'ORDER_COMPLETED':
        setOrdersRef.current((prev) =>
          prev.filter((o) => o.id !== data.payload.orderId) // remove completed orders from the list
        );
        break;
    }
  }

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) =>
        setOrders(
          data
            .filter((o) => o.status !== 'COMPLETED')
            .sort((a, b) => a.id - b.id)
        )
      )
      .catch(console.error);

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'), // Tells STOMP to use SockJS instead of raw WebSocket
      onDisconnect: () => setConnected(false),  // disables the "live" status dot in the UI
    });

    client.onConnect = () => {
      setConnected(true);  //enables the "live" status dot in the UI
      client.subscribe('/topic/kitchen', (message) => { // STOMP Subscribes to /topic/kitchen 
                                                    // and all new orders are broadcasted here
        handleKitchenMessage(JSON.parse(message.body)); 
      });
    };

    client.activate();  // Opens SockJS connection -> upgrades to STOMP -> triggers onConnect
    return () => client.deactivate(); // Cleanup
  }, []);

  async function startItem(orderId, itemId) {
    try {
      await fetch(`/api/orders/${orderId}/items/${itemId}/start`, {
        method: 'PATCH',
        headers: authHeader(),
      });
    } catch (err) {
      console.error('Failed to start item', err);
    }
  }

  async function markItemDone(orderId, itemId) {
    try {
      await fetch(`/api/orders/${orderId}/items/${itemId}/done`, {
        method: 'PATCH',
        headers: authHeader(),
      });
    } catch (err) {
      console.error('Failed to mark item done', err);
    }
  }

  // Each column is driven purely by individual item status
  const newTickets = orders
    .flatMap((o) =>
      o.items
        .filter((item) => !item.status || item.status === 'PENDING')
        .map((item) => ({ ...item, orderId: o.id }))
    )
    .sort((a, b) => a.id - b.id);

  const progressTickets = orders
    .flatMap((o) =>
      o.items
        .filter((item) => item.status === 'IN_PROGRESS')
        .map((item) => ({ ...item, orderId: o.id }))
    )
    .sort((a, b) => a.id - b.id);

  return (
    <div className="kitchen-page">
      <header className="kitchen-header">
        <div className="kitchen-brand">
          <span className="kitchen-brand-name">Le Château</span>
          <span className="kitchen-brand-sub">Kitchen Display</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className={`connection-status ${connected ? 'connection-status--live' : ''}`}>
            <span className="connection-dot" />
            {connected ? 'Live' : 'Disconnected'}
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Log out
          </button>
        </div>
      </header>

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
        <span className="ticket-name">{ticket.menuItemName}</span>
        <span className="ticket-qty">× {ticket.quantity}</span>
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

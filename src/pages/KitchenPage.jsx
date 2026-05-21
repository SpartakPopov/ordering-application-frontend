import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './KitchenPage.css';

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);

  
  const setOrdersRef = useRef(setOrders);
  setOrdersRef.current = setOrders;

  function handleKitchenMessage(data) {
    switch (data.type) {
      case 'NEW_ORDER':
        setOrdersRef.current((prev) => [data.payload, ...prev]);
        break;

      case 'ITEM_DONE':
        setOrdersRef.current((prev) =>
          prev.map((order) => {
            if (order.id !== data.payload.orderId) return order;
            return {
              ...order,
              items: order.items.map((item) =>
                item.id === data.payload.item.id
                  ? { ...item, status: 'DONE' }
                  : item
              ),
            };
          })
        );
        break;

      case 'ORDER_COMPLETED':
        setOrdersRef.current((prev) =>
          prev.map((order) =>
            order.id === data.payload.orderId
              ? { ...order, status: 'COMPLETED' }
              : order
          )
        );
        break;
    }
  }

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data.sort((a, b) => b.id - a.id)))
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

  async function markItemDone(orderId, itemId) {
    try {
      await fetch(`/api/orders/${orderId}/items/${itemId}/done`, {
        method: 'PATCH',
      });
    } catch (err) {
      console.error('Failed to mark item done', err);
    }
  }

  const activeOrders = orders.filter((o) => o.status === 'PENDING');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  return (
    <div className="kitchen-page">
      <header className="kitchen-header">
        <div className="kitchen-brand">
          <span className="kitchen-brand-name">Le Château</span>
          <span className="kitchen-brand-sub">Kitchen Display</span>
        </div>
        <div className={`connection-status ${connected ? 'connection-status--live' : ''}`}>
          <span className="connection-dot" />
          {connected ? 'Live' : 'Disconnected'}
        </div>
      </header>

      <div className="kitchen-body">
        <section className="kitchen-section">
          <h2 className="section-title">
            Active Orders
            {activeOrders.length > 0 && (
              <span className="section-count">{activeOrders.length}</span>
            )}
          </h2>

          {activeOrders.length === 0 ? (
            <div className="kitchen-empty">
              <p>No active orders — standing by.</p>
            </div>
          ) : (
            <div className="order-grid">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onMarkDone={markItemDone}
                />
              ))}
            </div>
          )}
        </section>

        {completedOrders.length > 0 && (
          <section className="kitchen-section kitchen-section--completed">
            <h2 className="section-title section-title--completed">
              Completed
              <span className="section-count section-count--completed">
                {completedOrders.length}
              </span>
            </h2>
            <div className="order-grid">
              {completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} onMarkDone={markItemDone} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onMarkDone }) {
  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className={`order-card ${isCompleted ? 'order-card--completed' : ''}`}>
      <div className="order-card-header">
        <div className="order-id">Order #{order.id}</div>
        <div className={`order-badge ${isCompleted ? 'order-badge--completed' : 'order-badge--pending'}`}>
          {isCompleted ? 'Completed' : 'Pending'}
        </div>
      </div>

      <ul className="item-list">
        {order.items.map((item) => {
          const isDone = item.status === 'DONE';
          return (
            <li key={item.id} className={`item-row ${isDone ? 'item-row--done' : ''}`}>
              <div className="item-row-info">
                <span className="item-name">
                  {item.menuItemName} × {item.quantity}
                </span>
                <span className="item-subtotal">€{item.subtotal?.toFixed(2)}</span>
              </div>
              <div className="item-row-action">
                {isDone ? (
                  <span className="item-done-mark">✓</span>
                ) : (
                  !isCompleted && (
                    <button
                      className="mark-done-btn"
                      onClick={() => onMarkDone(order.id, item.id)}
                    >
                      Mark Done
                    </button>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="order-card-footer">
        <span className="order-total-label">Total</span>
        <span className="order-total-price">€{order.totalPrice?.toFixed(2)}</span>
      </div>
    </div>
  );
}

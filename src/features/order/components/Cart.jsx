import { useEffect } from 'react';

export function Cart({
  cart,
  onIncrease,
  onDecrease,
  onRemove,
  onPlace,
  isSubmitting,
  orderStatus,
  lastOrder,
  onDismiss,
  onPayNow,
}) {
  const total = cart.reduce((sum, item) => sum + item.menuItemPrice * item.quantity, 0);
  const isEmpty = cart.length === 0;

  // Auto-dismiss success confirmation after 5 seconds
  useEffect(() => {
    if (orderStatus !== 'success') return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [orderStatus, onDismiss]);

  return (
    <aside className="cart-panel">
      <div className="cart-header">
        <h2 className="cart-title">Your Order</h2>
        {!isEmpty && (
          <span className="cart-count">{cart.reduce((n, i) => n + i.quantity, 0)}</span>
        )}
      </div>

      {orderStatus === 'success' && lastOrder && (
        <div className="order-confirmation">
          <div className="confirm-icon">✓</div>
          <p className="confirm-title">Order placed</p>
          <p className="confirm-detail">
            #{lastOrder.id} · €{lastOrder.totalPrice?.toFixed(2)}
          </p>
          <button className="pay-now-btn" onClick={onPayNow}>
            Pay now
          </button>
          <button className="dismiss-btn" onClick={onDismiss}>
            New order
          </button>
        </div>
      )}

      {orderStatus === 'error' && (
        <div className="order-error">
          <p>Something went wrong. Please try again.</p>
          <button className="dismiss-btn dismiss-btn--error" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      )}

      {orderStatus === null && (
        <>
          {isEmpty ? (
            <p className="cart-empty">No items selected yet.</p>
          ) : (
            <ul className="cart-list">
              {cart.map((item) => (
                <li key={item.menuItemId} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.menuItemName}</span>
                    <span className="cart-item-price">
                      €{(item.menuItemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      className={`qty-btn${item.quantity === 1 ? ' qty-btn--remove' : ''}`}
                      onClick={() => onDecrease(item.menuItemId)}
                      aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                      title={item.quantity === 1 ? 'Removes item from order' : undefined}
                    >
                      {item.quantity === 1 ? '×' : '−'}
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => onIncrease(item.menuItemId)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => onRemove(item.menuItemId)}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total-price">€{total.toFixed(2)}</span>
            </div>
            <button
              className="place-order-btn"
              onClick={onPlace}
              disabled={isEmpty || isSubmitting}
            >
              {isSubmitting ? 'Placing…' : 'Place Order'}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

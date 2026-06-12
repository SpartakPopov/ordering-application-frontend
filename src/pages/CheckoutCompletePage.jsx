import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearUnpaidOrders } from './BillPage';
import './CheckoutPage.css';

export default function CheckoutCompletePage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { totalPrice } = location.state || {};

  useEffect(() => {
    // Clear the bill only when arriving here from a real payment (state present)
    if (totalPrice !== undefined) {
      clearUnpaidOrders();
    }
  }, [totalPrice]);

  return (
    <div className="checkout-page">
      <div className="checkout-card checkout-card--centered">
        <div className="checkout-complete-icon">✓</div>
        <h1 className="checkout-title">Payment Successful</h1>
        {totalPrice && (
          <p className="checkout-total">€{totalPrice.toFixed(2)} paid</p>
        )}
        <p className="checkout-complete-note">
          Your order is being prepared in the kitchen.
        </p>
        <button className="pay-btn" onClick={() => navigate('/')}>
          Back to menu
        </button>
      </div>
    </div>
  );
}

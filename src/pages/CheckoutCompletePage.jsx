import { useLocation, useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

export default function CheckoutCompletePage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { totalPrice } = location.state || {};

  return (
    <div className="checkout-page">
      <div className="checkout-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h1 className="checkout-title">Payment Successful</h1>
        {totalPrice && (
          <p className="checkout-total">€{totalPrice.toFixed(2)} paid</p>
        )}
        <p style={{ color: '#888', marginBottom: '2rem' }}>
          Your order is being prepared in the kitchen.
        </p>
        <button className="pay-btn" onClick={() => navigate('/')}>
          Back to menu
        </button>
      </div>
    </div>
  );
}

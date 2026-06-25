import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './CheckoutPage.css';

// loadStripe is called OUTSIDE the component so it is never re-initialised on re-renders
let stripePromise = null;

async function getStripePromise() {
  if (stripePromise) return stripePromise;
  const res = await fetch('/api/payments/config');
  const { publishableKey } = await res.json();
  stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

// ── Inner form rendered inside the Elements provider ─────────────────────
function CheckoutForm({ totalPrice }) {
  const stripe   = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [message, setMessage]     = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return; // Stripe.js not yet loaded

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe will redirect here after 3D Secure if required
        return_url: `${window.location.origin}/checkout/complete`,
      },
      redirect: 'if_required', // only redirect for 3DS — stay on page for simple cards
    });

    if (error) {
      // User-facing error message from Stripe (e.g. "Your card was declined")
      setMessage(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      navigate('/checkout/complete', { state: { totalPrice } });
    }

    setIsLoading(false);
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        className="pay-btn"
        disabled={!stripe || isLoading}
      >
        {isLoading ? 'Processing…' : `Pay EUR${totalPrice?.toFixed(2)}`}
      </button>
      {message && <p className="checkout-error">{message}</p>}
    </form>
  );
}

// ── Page wrapper — fetches client_secret then renders Elements ────────────
export default function CheckoutPage() {
  const location  = useLocation();
  const navigate  = useNavigate();

  // totalPrice and orderId are passed from App.jsx via navigate state
  const { totalPrice, orderId } = location.state || {};

  const [clientSecret, setClientSecret] = useState(null);
  const [stripe, setStripe]             = useState(null);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (!totalPrice) {
      navigate('/'); // nothing to pay — go back to menu
      return;
    }

    const amountInCents = Math.round(totalPrice * 100);

    Promise.all([
      getStripePromise(),
      fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInCents }),
      }).then((r) => r.json()),
    ])
      .then(([stripeInstance, { clientSecret }]) => {
        setStripe(stripeInstance);
        setClientSecret(clientSecret);
      })
      .catch(() => setError('Could not initialise payment. Please try again.'));
  }, [totalPrice, navigate]);

  if (error) {
    return (
      <div className="checkout-page">
        <p className="checkout-error">{error}</p>
        <button className="pay-btn" onClick={() => navigate('/')}>Back to menu</button>
      </div>
    );
  }

  if (!clientSecret || !stripe) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">Preparing payment…</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h1 className="checkout-title">Complete Payment</h1>
        {orderId && <p className="checkout-order-id">Order #{orderId}</p>}
        <p className="checkout-total">Total: EUR{totalPrice?.toFixed(2)}</p>

        <Elements stripe={stripe} options={{ clientSecret }}>
          <CheckoutForm totalPrice={totalPrice} />
        </Elements>

        <p className="checkout-test-note">
          Test card: <code>4242 4242 4242 4242</code> · any future date · any CVC
        </p>
      </div>
    </div>
  );
}

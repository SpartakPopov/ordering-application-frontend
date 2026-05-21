import { useState } from 'react';
import './App.css';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { ErrorScreen } from '../components/ui/ErrorScreen';
import { TopNav, CategoryNav, MenuGrid, useMenu } from '../features/menu';
import { Cart, placeOrder } from '../features/order';

export default function App() {
  const { menuItems, categories, loading, error } = useMenu();
  const [activeCategory, setActiveCategory] = useState(null);

  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;

  const filteredItems = activeCategory
    ? menuItems.filter((item) => item.categoryId === activeCategory)
    : menuItems;

  function addToCart(menuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === menuItem.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          menuItemId: menuItem.id,
          menuItemName: menuItem.name,
          menuItemPrice: menuItem.price,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(menuItemId) {
    setCart((prev) =>
      prev.map((c) => (c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + 1 } : c))
    );
  }

  function decreaseQuantity(menuItemId) {
    setCart((prev) => {
      const entry = prev.find((c) => c.menuItemId === menuItemId);
      if (!entry) return prev;
      if (entry.quantity === 1) return prev.filter((c) => c.menuItemId !== menuItemId);
      return prev.map((c) => (c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c));
    });
  }

  function removeFromCart(menuItemId) {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  }

  async function handlePlaceOrder() {
    setIsSubmitting(true);
    try {
      const order = await placeOrder(cart);
      setLastOrder(order);
      setOrderStatus('success');
      setCart([]);
    } catch {
      setOrderStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function dismissOrderStatus() {
    setOrderStatus(null);
    setLastOrder(null);
  }

  return (
    <div className="app">
      <TopNav />
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
      <div className="app-body">
        <div className="menu-area">
          <MenuGrid
            items={filteredItems}
            categories={categories}
            cart={cart}
            onAdd={addToCart}
          />
        </div>
        <Cart
          cart={cart}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onRemove={removeFromCart}
          onPlace={handlePlaceOrder}
          isSubmitting={isSubmitting}
          orderStatus={orderStatus}
          lastOrder={lastOrder}
          onDismiss={dismissOrderStatus}
        />
      </div>
      <footer className="site-footer">
        © {new Date().getFullYear()} Le Château · All rights reserved
      </footer>
    </div>
  );
}

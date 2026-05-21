import { MenuCard } from './MenuCard';

export function MenuGrid({ items, categories, cart, onAdd }) {
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name.toUpperCase() : '';
  };

  const getCartQuantity = (itemId) => {
    const entry = cart.find((c) => c.menuItemId === itemId);
    return entry ? entry.quantity : 0;
  };

  return (
    <main className="menu-main">
      <div className="menu-heading">
        <div className="heading-line" />
        <h2 className="menu-title">Our Menu</h2>
        <p className="menu-subtitle">Authentic French cuisine delivered to your door</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No items in this category yet</p>
        </div>
      ) : (
        <div className="menu-grid">
          {items.map((item, index) => (
            <MenuCard
              key={item.id}
              item={item}
              categoryName={getCategoryName(item.categoryId)}
              index={index}
              onAdd={onAdd}
              cartQuantity={getCartQuantity(item.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

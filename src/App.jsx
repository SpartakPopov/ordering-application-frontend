import { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:8080/api";

export default function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/menu`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch menu items");
        return r.json();
      }),
      fetch(`${API_BASE}/categories`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch categories");
        return r.json();
      }),
    ])
      .then(([items, cats]) => {
        setMenuItems(items);
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredItems = activeCategory
    ? menuItems.filter((item) => item.categoryId === activeCategory)
    : menuItems;

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <div className="loading-spinner" />
          <p className="loading-text">Loading menu</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <div className="error-icon">!</div>
          <h2>Connection failed</h2>
          <p>Make sure your Spring Boot backend is running on localhost:8080</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <p className="eyebrow">Our selection</p>
        <h1>The Menu</h1>
        <p className="item-count">{menuItems.length} items available</p>
      </header>

      <nav className="category-nav">
        <button
          className={`filter-btn${!activeCategory ? " active" : ""}`}
          onClick={() => setActiveCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn${activeCategory === cat.id ? " active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      <main className="menu-main">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>No items in this category yet</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="menu-card"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="card-meta">
                  <span className="card-category">{getCategoryName(item.categoryId)}</span>
                 
                </div>

                <h3 className="card-name">{item.name}</h3>

                <div className="card-footer">
                  <span className="card-price">€{item.price?.toFixed(2)}</span>
                  <span className="card-available">Available</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="site-footer">
        Ordering App — {new Date().getFullYear()}
      </footer>
    </div>
  );
}

import { useState } from 'react';
import './App.css';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { ErrorScreen } from '../components/ui/ErrorScreen';
import { TopNav, CategoryNav, MenuGrid, useMenu } from '../features/menu';

export default function App() {
  const { menuItems, categories, loading, error } = useMenu();
  const [activeCategory, setActiveCategory] = useState(null);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;

  const filteredItems = activeCategory
    ? menuItems.filter((item) => item.categoryId === activeCategory)
    : menuItems;

  return (
    <div className="app">
      <TopNav />
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
      <MenuGrid items={filteredItems} categories={categories} />
      <footer className="site-footer">
        © {new Date().getFullYear()} Le Château · All rights reserved
      </footer>
    </div>
  );
}

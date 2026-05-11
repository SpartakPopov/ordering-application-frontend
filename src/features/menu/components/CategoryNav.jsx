export function CategoryNav({ categories, activeCategory, onSelect }) {
  return (
    <nav className="category-nav">
      <button
        className={`filter-btn${!activeCategory ? ' active' : ''}`}
        onClick={() => onSelect(null)}
      >
        ALL
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`filter-btn${activeCategory === cat.id ? ' active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name.toUpperCase()}
        </button>
      ))}
    </nav>
  );
}

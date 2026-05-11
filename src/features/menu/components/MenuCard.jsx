export function MenuCard({ item, categoryName, index }) {
  return (
    <div className="menu-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="card-image">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} />
          : <div className="card-image-placeholder" />
        }
        <span className="card-badge">{categoryName}</span>
      </div>
      <div className="card-body">
        <h3 className="card-name">{item.name}</h3>
        {item.description && (
          <p className="card-description">{item.description}</p>
        )}
        <div className="card-footer">
          <span className="card-price">€{item.price?.toFixed(0)}</span>
          <button className="add-btn">ADD</button>
        </div>
      </div>
    </div>
  );
}

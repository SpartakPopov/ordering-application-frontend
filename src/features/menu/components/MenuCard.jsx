export function MenuCard({ item, categoryName, index, onAdd, cartQuantity }) {
  return (
    <div
      className={`menu-card${cartQuantity > 0 ? ' menu-card--in-cart' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="card-image">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} />
          : <div className="card-image-placeholder" />
        }
        <span className="card-badge">{categoryName}</span>
        {cartQuantity > 0 && (
          <span className="card-qty-badge">{cartQuantity}</span>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-name">{item.name}</h3>
        {item.description && (
          <p className="card-description">{item.description}</p>
        )}
        <div className="card-footer">
          <span className="card-price">€{item.price?.toFixed(2)}</span>
          <button className="add-btn" onClick={() => onAdd(item)}>
            {cartQuantity > 0 ? 'ADD MORE' : 'ADD'}
          </button>
        </div>
      </div>
    </div>
  );
}

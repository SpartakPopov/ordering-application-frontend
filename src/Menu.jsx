import burger from './assets/41824ms-albums-5.webp'
import './Menu.css'

function Menu(){
    return(
        <div className="menu-section">
            <div className="section-title">
                <span className="label">Our Menu</span>
                <h2>Check Our Tasty Menu</h2>
            </div>

            <div className="food-item">
                <div className="food-item-inner">
                    <img src={burger} alt="Burger" />
                    <div className="food-item-body">
                        <div className="food-item-row">
                            <span className="food-name">Burger</span>
                            <span className="food-price">$15.00</span>
                        </div>
                        <p className="food-desc">brioche bun, aged cheddar, caramelised onions</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Menu

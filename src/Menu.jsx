import burger from './assets/41824ms-albums-5.webp'

import './Menu.css'

function Menu(){
    const item1 ="Bruger"
    const item2 ="Salad"

    return(
       <div className="food-item">
        <img  src={burger} alt="img of a burger" />
        <p>Burger</p>
        <p>15.00$</p>
       </div>
    )
}

export default Menu
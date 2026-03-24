import logo from './assets/logo.webp'
import './Header.css'

function Header(){
    return(
        <header>
            <img src={logo} alt="Logo" className="logo" />
            <nav>
                <ul><a href="#">Amuse-Bouche</a></ul>
                <ul><a href="#">Hors d'Œuvres</a></ul>
                <ul><a href="#">Poisson</a></ul>
                <ul><a href="#">Viande</a></ul>
                <ul><a href="#">Fromage</a></ul>
                <ul><a href="#">Dessert</a></ul>
                <ul><a href="#">Petit Fours & Café</a></ul>
            </nav>
            <button className="btn-book">Book a Table</button>
        </header>
    )
}

export default Header

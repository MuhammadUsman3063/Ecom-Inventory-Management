// customer-frontend/src/components/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// ✅ Import Navbar CSS
import './Navbar.css'; // Yeh file ab hum banayenge

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={isAuthenticated ? "/home" : "/"}>Usman-Store</Link>
      </div>
      <ul className="navbar-links">
        {isAuthenticated && (
          <li><Link to="/home" className="nav-link">Home</Link></li>
        )}
        {isAuthenticated && (
          <li><Link to="/products" className="nav-link">Products</Link></li>
        )}
        {isAuthenticated && (
          // ✅ Cart link with conditional badge for count
          <li className="cart-link-container">
            <Link to="/cart" className="nav-link cart-link">
              Cart
              {cartItems.length > 0 && (
                <span className="cart-count-badge">{cartItems.length}</span>
              )}
            </Link>
          </li>
        )}

        {isAuthenticated ? (
          <>
            <li><Link to="/orders/history" className="nav-link">My Orders</Link></li>
            <li><span className="welcome-message">Welcome, {user?.name || user?.email}!</span></li>
            <li>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="nav-link">Login</Link></li>
            <li><Link to="/register" className="nav-link">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
// customer-frontend/src/pages/CartPage.jsx
import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ✅ Import useAuth hook

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated, getToken } = useAuth(); // ✅ Get user, isAuthenticated, and getToken from AuthContext

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.Price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Please log in to place an order.');
      // Optional: redirect to login page
      // navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      return;
    }

    // Prepare cart items for the backend
    const itemsToOrder = cartItems.map(item => ({
      ID: item.ID, // Product ID
      quantity: item.quantity, // Quantity from cart
      Price: item.Price, // Price of the product (backend will also verify)
      Name: item.Name // For error messages or logging on backend (optional for backend)
    }));

    try {
      const token = getToken(); // Get the JWT token
      if (!token) {
        alert('Authentication token missing. Please log in again.');
        return;
      }

      // ✅ Add customerId to the payload
      const orderPayload = {
        cartItems: itemsToOrder,
        customerId: user.id // ✅ Send the logged-in user's ID as customerId
      };

      // API call to backend to place the order with authorization header
      const response = await axios.post('http://localhost:5000/api/orders', orderPayload, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Send the authentication token
        },
      });

      console.log('Order placed successfully:', response.data);
      alert(`Order placed successfully! Order ID: ${response.data.orderID}`);
      clearCart(); // Clear the cart after successful order
      // Optionally, redirect to an order confirmation page or order history
      // navigate('/order-confirmation', { state: { orderId: response.data.orderID } });

    } catch (error) {
      console.error('Error during checkout:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Checkout failed: ${error.response.data.message}`);
      } else {
        alert('Checkout failed. Please try again.');
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <h2>Your Cart</h2>
        <p>Your cart is empty. Start adding some products!</p>
        <Link to="/products" className="primary" style={{ textDecoration: 'none' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Your Shopping Cart</h2>
      <div className="cart-items-list">
        {cartItems.map(item => (
          <div key={item.ID} className="cart-item">
            <img src={item.ImageUrl} alt={item.Name} />
            <div className="cart-item-details">
              <h3>{item.Name}</h3>
              <p>Price: Rs. {item.Price}</p>
            </div>
            <div className="cart-item-actions">
              <button onClick={() => updateQuantity(item.ID, item.quantity - 1)} className="danger">
                -
              </button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.ID, parseInt(e.target.value, 10))}
                min="1"
                style={{ width: '50px', textAlign: 'center' }}
              />
              <button onClick={() => updateQuantity(item.ID, item.quantity + 1)} className="success">
                +
              </button>
              <button onClick={() => removeFromCart(item.ID)} className="danger" style={{ marginLeft: '15px' }}>
                Remove
              </button>
            </div>
            <p style={{ fontWeight: 'bold', marginLeft: '30px', minWidth: '100px', textAlign: 'right' }}>
              Rs. {(item.Price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <div className="cart-total-section">
        <h3>Total: Rs. {calculateTotal()}</h3>
        <button
          className="primary"
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
        <Link to="/products" style={{ display: 'block', marginTop: '15px', textDecoration: 'none', color: '#007bff' }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default CartPage;
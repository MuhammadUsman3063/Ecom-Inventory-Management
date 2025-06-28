// customer-frontend/src/pages/OrderHistoryPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ✅ useAuth hook import karein
import './OrderHistoryPage.css'; // ✅ Styling ke liye CSS file (hum ab banayenge)

function OrderHistoryPage() {
  const { user, isAuthenticated, getToken } = useAuth(); // ✅ user, isAuthenticated, aur getToken
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        setError('Please log in to view your order history.');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = await getToken(); // ✅ Authenticated request ke liye token lein

        const response = await axios.get('http://localhost:5000/api/orders/customer', {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Authorization header mein token bhejein
          },
        });

        // Backend se mili hui OrderDate string ko Date object mein convert karein
        const formattedOrders = response.data.map(order => ({
          ...order,
          OrderDate: new Date(order.OrderDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        }));

        setOrders(formattedOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('Failed to load order history. Please try again.');
        setLoading(false);
        // Agar 401/403 error hai toh user ko logout karne ka option ya redirect ka socha ja sakta hai
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Session expired or unauthorized. Please log in again.');
          // logout(); // Optional: Agar session expired ho toh auto-logout
        }
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, getToken]); // Dependencies: jab user state ya auth status badle toh re-run ho

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading-message">Loading your order history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <h2>My Order History</h2>
      {orders.length === 0 ? (
        <p className="no-orders-message">You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.OrderID} className="order-card">
              <div className="order-header">
                <h3>Order ID: {order.OrderID}</h3>
                <span className={`order-status status-${order.Status.toLowerCase()}`}>
                  {order.Status}
                </span>
              </div>
              <div className="order-details">
                <p><strong>Date:</strong> {order.OrderDate}</p>
                <p><strong>Total Amount:</strong> ${order.TotalAmount.toFixed(2)}</p>
                <p><strong>Items:</strong> {order.NumberOfItems || 0}</p>
                {/* Agar OrderItem details dikhane hain, toh ek expandable section ya separate page bana sakte hain */}
                {/* <button className="view-details-button">View Details</button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;
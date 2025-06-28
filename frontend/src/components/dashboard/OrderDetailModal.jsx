// src/components/dashboard/OrderDetailModal.jsx
import React, { useState, useEffect } from 'react'; // ✅ Import useEffect
import axios from 'axios';
import './OrderDetailModal.css';

function OrderDetailModal({ isOpen, onClose, order, onOrderUpdated }) { // ✅ Added onOrderUpdated prop
  const [status, setStatus] = useState(order ? order.OrderStatus : '');

  useEffect(() => {
    if (order) {
      setStatus(order.OrderStatus);
    }
  }, [order]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    if (!order) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/orders/${order.OrderID}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optionally, update the local order object
      if (onOrderUpdated) {
        onOrderUpdated(response.data);
      }
      onClose();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert('Failed to update order status.');
    }
  };

  if (!isOpen || !order) {
    return null;
  }

  return (
    <div className="order-detail-modal-overlay">
      <div className="order-detail-modal">
        <h3>Order Details (ID: {order.OrderID})</h3>
        <p>Order Date: {new Date(order.OrderDate).toLocaleDateString()}</p>
        <div>
          <label htmlFor="status">Status:</label>
          <select id="status" value={status} onChange={handleStatusChange}>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <h4>Items:</h4>
        {order.items && order.items.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.OrderItemID}>
                  <td>{item.ProductName}</td>
                  <td>{item.Quantity}</td>
                  <td>
                    {/* ✅ FIX: Conditionally render or provide a default if ProductPrice is undefined/null */}
                    {item.ProductPrice !== undefined && item.ProductPrice !== null
                      ? `$${item.ProductPrice.toFixed(2)}`
                      : 'N/A'} {/* 'N/A' or '$0.00' if you prefer */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items in this order.</p>
        )}
        {/* ✅ FIX: Conditionally render or provide a default for TotalAmount as well */}
        <p>Total Amount: {order.TotalAmount !== undefined && order.TotalAmount !== null
          ? `$${order.TotalAmount.toFixed(2)}`
          : 'N/A'}</p>
        <div className="modal-actions">
          <button onClick={handleSaveStatus}>Save Status</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
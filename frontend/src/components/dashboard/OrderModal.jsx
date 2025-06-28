// src/components/dashboard/OrderModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderModal.css';

function OrderModal({ isOpen, onClose ,onOrderCreated }) {
  const [products, setProducts] = useState([]);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [loading, setLoading] = useState(false); // Initialize to false
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Set loading to true when fetching starts
      setError(null); // Clear any previous error
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched Products:', response.data); // Log fetched products
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products in Modal:', err); // Log error
        setError(err.message || 'Failed to fetch products');
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
    } else {
      setProducts([]);
      setOrderQuantities({});
      setLoading(false); // Reset loading on close
      setError(null); // Reset error on close
    }
  }, [isOpen]);

  const handleQuantityChange = (productId, quantity) => {
    setOrderQuantities(prev => ({
      ...prev,
      [productId]: parseInt(quantity, 10) >= 0 ? parseInt(quantity, 10) : 0,
    }));
  };

  const handleSaveOrder = async () => {
    const orderItemsToSend = Object.keys(orderQuantities)
      .filter(productId => orderQuantities[productId] > 0)
      .map(productId => {
        const product = products.find(p => p.ID === parseInt(productId));
        return {
          ProductID: parseInt(productId),
          Quantity: orderQuantities[productId],
          PricePerUnit: product ? product.Price : 0,
        };
      });

    if (orderItemsToSend.length === 0) {
      alert('Please select at least one product to order.');
      return;
    }

    const totalAmount = orderItemsToSend.reduce((sum, item) => sum + (item.Quantity * item.PricePerUnit), 0);

    try {
      const token = localStorage.getItem('token');
     await axios.post('http://localhost:5000/api/orders', { orderItems: orderItemsToSend, totalAmount }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Order created successfully!');
      onClose();
      onOrderCreated();
      // TODO: Refresh the order list in OrdersPage
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create New Order</h3>
        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : products && products.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Available</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.ID}>
                  <td>{product.Name}</td>
                  <td>${product.Price}</td>
                  <td>{product.Quantity}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={orderQuantities[product.ID] || ''}
                      onChange={(e) => handleQuantityChange(product.ID, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products available.</p>
        )}
        <div className="modal-actions">
          <button className="save-btn" onClick={handleSaveOrder}>Save Order</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default OrderModal;
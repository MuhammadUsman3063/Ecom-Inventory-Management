// src/components/dashboard/OrdersPage.jsx
import React, { useState } from 'react'; // Import useState
import OrderList from './OrderList';
import OrderModal from './OrderModal'; // Import OrderModal
import './OrdersPage.css';

function OrdersPage() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false); // State for modal visibility

  const openOrderModal = () => {
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  const [refreshOrders, setRefreshOrders] = useState(false);

  const handleOrderCreated = () => {
    setRefreshOrders(prev => !prev);
  };

  return (
    <div className="orders-page">
      <h2>Order Management</h2>
      <button className="add-order-btn" onClick={openOrderModal}>Create New Order</button> {/* Use openOrderModal */}
    <OrderList refresh={refreshOrders} />
     <OrderModal
        isOpen={isOrderModalOpen}
        onClose={closeOrderModal}
        onOrderCreated={handleOrderCreated} // ✅ Pass handleOrderCreated as onOrderCreated
      />
    </div>
  );
}

export default OrdersPage;
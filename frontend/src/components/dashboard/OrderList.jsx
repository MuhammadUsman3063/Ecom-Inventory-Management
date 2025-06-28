import React, { useState, useEffect, useCallback } from 'react'; // ✅ Import useCallback
import axios from 'axios';
import './OrderList.css';
import OrderDetailModal from './OrderDetailModal'; // ✅ Import the modal

function OrderList({ refresh }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 2;
  const [selectedOrderId, setSelectedOrderId] = useState(null); // ✅ State for selected order ID
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false); // ✅ State for modal visibility
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); // ✅ State for order details
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');

const fetchOrders = async (page, statusFilter = '', sortOption = '', searchOrderId = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:5000/api/orders?page=${page}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      if (sortOption) {
        url += `&sortBy=${sortOption}`;
      }
      if (searchOrderId) {
        url += `&search=${searchOrderId}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Paginated Orders Response:', response.data);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || 'Failed to fetch orders');
      setLoading(false);
    }
  };

  const fetchOrderDetails = useCallback(async (orderId) => { // ✅ useCallback for memoization
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrderDetails(response.data);
      setIsOrderDetailModalOpen(true);
    } catch (err) {
      console.error("Error fetching order details:", err);
      alert('Failed to fetch order details.');
    }
  }, []);

useEffect(() => {
    fetchOrders(currentPage, statusFilter, sortOption); // ✅ Pass filter and sort options
  }, [currentPage, refresh, statusFilter, sortOption]); // ✅ Add dependencies

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const openOrderDetailModal = (orderId) => {
    setSelectedOrderId(orderId);
    fetchOrderDetails(orderId);
  };

  const closeOrderDetailModal = () => {
    setIsOrderDetailModalOpen(false);
    setSelectedOrderDetails(null);
    setSelectedOrderId(null);
  };
  const handleOrderUpdatedInList = (updatedOrder) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.OrderID === updatedOrder.OrderID ? updatedOrder : order
      )
    );
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1); // Reset page on filter change
  };

  const handleSortOptionChange = (event) => {
    setSortOption(event.target.value);
    setCurrentPage(1); // Reset page on sort change
  };

  const handleSearchChange = (event) => {
    setSearchOrderId(event.target.value);
  };

  const handleSearchSubmit = () => {
    fetchOrders(1, statusFilter, sortOption, searchOrderId); // Fetch with search term, reset page
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="order-list">
      <h2>Orders</h2>

<div className="search-bar">
        <label htmlFor="searchOrderId">Search by Order ID:</label>
        <input
          type="text"
          id="searchOrderId"
          value={searchOrderId}
          onChange={handleSearchChange}
          placeholder="Enter Order ID"
        />
        <button onClick={handleSearchSubmit}>Search</button>
      </div>

      <div className="filter-sort">
        <div>
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select id="statusFilter" value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortOption">Sort by:</label>
          <select id="sortOption" value={sortOption} onChange={handleSortOptionChange}>
            <option value="">None</option>
            <option value="orderDateAsc">Order Date (Asc)</option>
            <option value="orderDateDesc">Order Date (Desc)</option>
            <option value="totalAmountAsc">Total Amount (Asc)</option>
            <option value="totalAmountDesc">Total Amount (Desc)</option>
          </select>
        </div>
      </div>
      {(orders && orders.length === 0) ? (
        <p>No orders found.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.map(order => (
                <tr key={order.OrderID} onClick={() => openOrderDetailModal(order.OrderID)} style={{ cursor: 'pointer' }}> {/* ✅ Clickable row */}
                  <td>{order.OrderID}</td>
                  <td>{new Date(order.OrderDate).toLocaleDateString()}</td>
                  <td>{order.OrderStatus}</td>
                  <td>${order.TotalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages}>Next</button>
          </div>
        </>
      )}
      <OrderDetailModal
        isOpen={isOrderDetailModalOpen}
        onClose={closeOrderDetailModal}
        order={selectedOrderDetails}
        onOrderUpdated={handleOrderUpdatedInList} // ✅ Pass this function
      />
    </div>
  );
}

export default OrderList;
// src/components/dashboard/CustomerList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerList.css';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/customers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err.message || 'Failed to fetch customers');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSaveNewCustomer = async (newCustomerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/customers',
        newCustomerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(prev => [...prev, response.data]);
      closeAddModal();
    } catch (error) {
      console.error("Error adding customer:", error);
      alert('Failed to add customer.');
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingCustomer(null);
    setIsEditModalOpen(false);
  };

  const handleUpdateCustomer = async (updatedCustomerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/customers/${updatedCustomerData.CustomerID}`,
        updatedCustomerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(prev =>
        prev.map(customer =>
          customer.CustomerID === response.data.CustomerID ? response.data : customer
        )
      );
      closeEditModal();
    } catch (error) {
      console.error("Error updating customer:", error);
      alert('Failed to update customer.');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(prev => prev.filter(customer => customer.CustomerID !== customerId));
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert('Failed to delete customer.');
      }
    }
  };

  if (loading) {
    return <div>Loading customers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="customer-list-container">
      <h2>Customers</h2>
      <button onClick={openAddModal}>Add New Customer</button>

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSave={handleSaveNewCustomer}
      />

      {isEditModalOpen && editingCustomer && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          customer={editingCustomer}
          onSave={handleUpdateCustomer}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.CustomerID}>
              <td>{customer.CustomerID}</td>
              <td>{customer.Name}</td>
              <td>{customer.Email}</td>
              <td>{customer.Phone}</td>
              <td>{customer.Address}</td>
              <td>
                <button onClick={() => openEditModal(customer)}>Edit</button>
                <button className="delete-button" onClick={() => handleDeleteCustomer(customer.CustomerID)}>Delete</button> {/* ✅ Delete Button */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerList;
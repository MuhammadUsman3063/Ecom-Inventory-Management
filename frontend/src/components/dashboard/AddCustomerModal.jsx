// src/components/dashboard/AddCustomerModal.jsx
import React, { useState } from 'react';
import './AddCustomerModal.css';

function AddCustomerModal({ isOpen, onClose, onSave }) {
  const [newCustomer, setNewCustomer] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Address: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(newCustomer);
    setNewCustomer({ Name: '', Email: '', Phone: '', Address: '' });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Add New Customer</h3>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="Name"
            value={newCustomer.Name}
            onChange={handleInputChange}
            placeholder="Enter customer name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="Email"
            value={newCustomer.Email}
            onChange={handleInputChange}
            placeholder="Enter customer email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            id="phone"
            name="Phone"
            value={newCustomer.Phone}
            onChange={handleInputChange}
            placeholder="Enter customer phone"
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="Address"
            value={newCustomer.Address}
            onChange={handleInputChange}
            placeholder="Enter customer address"
          />
        </div>
        <div className="modal-actions">
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCustomerModal;
// src/components/dashboard/EditCustomerModal.jsx
import React, { useState, useEffect } from 'react';
import './EditCustomerModal.css';

function EditCustomerModal({ isOpen, onClose, customer, onSave }) {
  const [editedCustomer, setEditedCustomer] = useState(null);

  useEffect(() => {
    if (customer) {
      setEditedCustomer({ ...customer });
    }
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (editedCustomer) {
      onSave(editedCustomer);
    }
  };

  if (!isOpen || !editedCustomer) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Edit Customer</h3>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="Name"
            value={editedCustomer.Name || ''}
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
            value={editedCustomer.Email || ''}
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
            value={editedCustomer.Phone || ''}
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
            value={editedCustomer.Address || ''}
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

export default EditCustomerModal;
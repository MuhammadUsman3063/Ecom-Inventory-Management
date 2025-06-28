// src/components/dashboard/AddSupplierModal.jsx
import React, { useState, useEffect } from 'react';
import './AddSupplierModal.css';

function AddSupplierModal({ isOpen, onClose, onSave, initialSupplier }) {
  const [supplierData, setSupplierData] = useState({
    Name: '',
    ContactPerson: '',
    Email: '',
    Phone: '',
    Address: '',
    SupplierID: null, // Add SupplierID for editing
  });

  useEffect(() => {
    if (initialSupplier) {
      setSupplierData(initialSupplier);
    } else {
      setSupplierData({ Name: '', ContactPerson: '', Email: '', Phone: '', Address: '', SupplierID: null }); // Reset form
    }
  }, [initialSupplier]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSupplierData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(supplierData);
    onClose();
    // Reset form only if not in edit mode
    if (!initialSupplier) {
      setSupplierData({ Name: '', ContactPerson: '', Email: '', Phone: '', Address: '', SupplierID: null });
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalTitle = initialSupplier ? 'Edit Supplier' : 'Add New Supplier';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h3 className="modal-title">{modalTitle}</h3>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="Name"
            value={supplierData.Name}
            onChange={handleInputChange}
            placeholder="Enter supplier name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="contactPerson">Contact Person</label>
          <input
            type="text"
            id="contactPerson"
            name="ContactPerson"
            value={supplierData.ContactPerson || ''}
            onChange={handleInputChange}
            placeholder="Enter contact person name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="Email"
            value={supplierData.Email || ''}
            onChange={handleInputChange}
            placeholder="Enter supplier email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            id="phone"
            name="Phone"
            value={supplierData.Phone || ''}
            onChange={handleInputChange}
            placeholder="Enter supplier phone"
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="Address"
            value={supplierData.Address || ''}
            onChange={handleInputChange}
            placeholder="Enter supplier address"
          />
        </div>
        {initialSupplier && (
          <input type="hidden" name="SupplierID" value={supplierData.SupplierID} />
        )}
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

export default AddSupplierModal;
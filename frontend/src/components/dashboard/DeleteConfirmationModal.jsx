// src/components/dashboard/DeleteConfirmationModal.jsx
import React from 'react';
import './DeleteConfirmationModal.css';

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Confirm Delete</h3>
        <p>Are you sure you want to delete "{itemName}"?</p>
        <div className="modal-actions">
          <button className="confirm-button" onClick={onConfirm}>
            Yes, Delete
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
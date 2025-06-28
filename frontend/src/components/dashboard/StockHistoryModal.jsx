// src/components/dashboard/StockHistoryModal.jsx
import React from 'react';
import './StockHistoryModal.css'; // Import CSS

function StockHistoryModal({ isOpen, onClose, productId, adjustments }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Stock Adjustment History for Product ID: {productId}</h2>
        {adjustments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Adjusted By</th>
                <th>Old Quantity</th>
                <th>New Quantity</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map(adj => (
                <tr key={adj.AdjustmentID}>
                  <td>{new Date(adj.AdjustmentDate).toLocaleDateString()}</td>
                  <td>{adj.AdjustedBy || 'N/A'}</td>
                  <td>{adj.OldQuantity}</td>
                  <td>{adj.NewQuantity}</td>
                  <td>{adj.Reason || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No history available for this product.</p>
        )}
      </div>
    </div>
  );
}

export default StockHistoryModal;
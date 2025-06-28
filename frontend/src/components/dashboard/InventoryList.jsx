// src/components/dashboard/InventoryList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryList.css';
import StockHistoryModal from './StockHistoryModal';

function InventoryList() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingQuantityId, setEditingQuantityId] = useState(null);
    const [editedQuantities, setEditedQuantities] = useState({});
const [historyModalOpen, setHistoryModalOpen] = useState(false);
const [selectedProductIdForHistory, setSelectedProductIdForHistory] = useState(null);
const [stockAdjustments, setStockAdjustments] = useState([]);

    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/inventory', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setInventory(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching inventory:", err);
                setError(err.message || 'Failed to fetch inventory');
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    const handleEditQuantity = (inventoryId, currentQuantity) => {
        setEditingQuantityId(inventoryId);
        setEditedQuantities({ ...editedQuantities, [inventoryId]: currentQuantity });
    };

    const handleQuantityChange = (event, inventoryId) => {
        setEditedQuantities({ ...editedQuantities, [inventoryId]: parseInt(event.target.value, 10) });
    };

    const handleSaveQuantity = async (productId, inventoryId) => {
        const newQuantity = editedQuantities[inventoryId];
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/inventory/${productId}`,
                { quantity: newQuantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInventory(prevInventory =>
                prevInventory.map(item =>
                    item.InventoryID === inventoryId ? response.data : item
                )
            );
            setEditingQuantityId(null);
            setEditedQuantities(prev => {
                const newState = { ...prev };
                delete newState[inventoryId];
                return newState;
            });
        } catch (error) {
            console.error("Error updating quantity:", error);
            alert('Failed to update quantity.');
        }
    };

    if (loading) {
        return <div>Loading inventory...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const fetchStockAdjustments = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:5000/api/stock-adjustments/${productId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setStockAdjustments(response.data);
  } catch (error) {
    console.error("Error fetching stock adjustments:", error);
    alert('Failed to fetch stock adjustment history.');
  }
};

const openHistoryModal = (productId) => {
  setSelectedProductIdForHistory(productId);
  fetchStockAdjustments(productId);
  setHistoryModalOpen(true);
};

const closeHistoryModal = () => {
  setHistoryModalOpen(false);
  setSelectedProductIdForHistory(null);
  setStockAdjustments([]);
};




 return (
        <div className="inventory-list-container">
            <h2>Inventory Management</h2>
            <div className="inventory-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product Name</th>
                            <th>Quantity in Stock</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item, index) => (
                            <tr
                                key={item.InventoryID}
                                className={item.Quantity < 5 && item.Quantity > 0 ? 'low-stock' : ''}
                            >
                                <td>{index + 1}</td>
                                <td>{item.ProductName}</td>
                                <td className={item.Quantity < 5 && item.Quantity > 0 ? 'low-stock-qty' : ''}>
                                    {editingQuantityId === item.InventoryID ? (
                                        <>
                                            <input
                                                type="number"
                                                value={editedQuantities[item.InventoryID] !== undefined ? editedQuantities[item.InventoryID] : item.Quantity}
                                                onChange={(e) => handleQuantityChange(e, item.InventoryID)}
                                            />
                                            <button onClick={() => handleSaveQuantity(item.ProductID, item.InventoryID)}>Save</button>
                                        </>
                                    ) : (
                                        item.Quantity === 0 ? (
                                            <span className="out-of-stock">Out of Stock</span>
                                        ) : (
                                            item.Quantity
                                        )
                                    )}
                                </td>
                                <td>{item.LastUpdated ? new Date(item.LastUpdated).toLocaleDateString() : 'N/A'}</td>
                                <td>
  {editingQuantityId !== item.InventoryID ? (
    <>
      <button onClick={() => handleEditQuantity(item.InventoryID, item.Quantity)}>Edit Qty</button>
      <button onClick={() => openHistoryModal(item.ProductID)}>View History</button> {/* ✅ New button */}
    </>
  ) : null}
</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <StockHistoryModal
              isOpen={historyModalOpen}
              onClose={closeHistoryModal}
              productId={selectedProductIdForHistory}
              adjustments={stockAdjustments}
            />
        </div>
    );
}

export default InventoryList;
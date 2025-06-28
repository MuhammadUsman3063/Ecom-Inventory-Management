// src/components/dashboard/SupplierList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SupplierList.css';
import AddSupplierModal from './AddSupplierModal'; // Reuse for editing too
import DeleteConfirmationModal from './DeleteConfirmationModal'; // We'll create this later

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/suppliers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuppliers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        setError(err.message || 'Failed to fetch suppliers');
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setIsAddModalOpen(true);
    setEditingSupplier(null); // Reset editing supplier
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSaveNewSupplier = async (newSupplierData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/suppliers',
        newSupplierData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuppliers(prev => [...prev, response.data]);
      closeAddModal();
    } catch (error) {
      console.error("Error adding supplier:", error);
      alert('Failed to add supplier.');
    }
  };

  const handleUpdateSupplier = async (updatedSupplierData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/suppliers/${updatedSupplierData.SupplierID}`,
        updatedSupplierData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuppliers(prev =>
        prev.map(supplier =>
          supplier.SupplierID === response.data.SupplierID ? response.data : supplier
        )
      );
      closeEditModal();
    } catch (error) {
      console.error("Error updating supplier:", error);
      alert('Failed to update supplier.');
    }
  };

  const openDeleteConfirmation = (supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setIsDeleteModalOpen(false);
    setSupplierToDelete(null);
  };

  const handleDeleteSupplier = async (supplierId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/suppliers/${supplierId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(prev => prev.filter(supplier => supplier.SupplierID !== supplierId));
      closeDeleteConfirmation();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert('Failed to delete supplier.');
    }
  };

  if (loading) {
    return <div>Loading suppliers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="supplier-list-container">
      <h2>Suppliers</h2>
      <button onClick={openAddModal}>Add New Supplier</button>

      {isAddModalOpen && (
        <AddSupplierModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          onSave={handleSaveNewSupplier}
        />
      )}

      {isEditModalOpen && editingSupplier && (
        <AddSupplierModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSave={handleUpdateSupplier}
          initialSupplier={editingSupplier} // Pass the supplier data for editing
        />
      )}

      <div className="supplier-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
              <tr key={supplier.SupplierID}>
                <td>{supplier.SupplierID}</td>
                <td>{supplier.Name}</td>
                <td>{supplier.ContactPerson}</td>
                <td>{supplier.Email}</td>
                <td>{supplier.Phone}</td>
                <td>{supplier.Address}</td>
                <td>
                  <button onClick={() => openEditModal(supplier)}>Edit</button>
                  <button className="delete-button" onClick={() => openDeleteConfirmation(supplier)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDeleteModalOpen && supplierToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteConfirmation}
          onConfirm={() => handleDeleteSupplier(supplierToDelete.SupplierID)}
          itemName={supplierToDelete.Name}
        />
      )}
    </div>
  );
}

export default SupplierList;
// admin-frontend/src/components/ProductModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductModal.css';

// ✅ onSaveProduct prop ko rename karke onAddProduct karen
function ProductModal({ isOpen, onClose, onAddProduct, editingProduct }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [errorDropdowns, setErrorDropdowns] = useState(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.Name || '');
      setPrice(editingProduct.Price?.toString() || '');
      setStockQuantity(editingProduct.Quantity?.toString() || '');
      setCategory(editingProduct.Category || '');
      setSupplierId(editingProduct.SupplierID?.toString() || '');
      setExistingImageUrl(editingProduct.ImageUrl ? `http://localhost:5000${editingProduct.ImageUrl}` : '');
      setImageFile(null);
    } else {
      setName('');
      setPrice('');
      setStockQuantity('');
      setCategory('');
      setSupplierId('');
      setImageFile(null);
      setExistingImageUrl('');
    }
  }, [editingProduct, isOpen]);

  useEffect(() => {
    if (isOpen) {
      
      const fetchData = async () => {
        
        setLoadingDropdowns(true);
        setErrorDropdowns(null);
        try {
          const categoriesRes = await axios.get('http://localhost:5000/api/categories');
          setCategories(categoriesRes.data);
          console.log('Categories received by frontend:', categoriesRes.data); // ADDED THIS LINE

          const suppliersRes = await axios.get('http://localhost:5000/api/suppliers');
          setSuppliers(suppliersRes.data);

        } catch (err) {
          console.error('Error fetching categories/suppliers:', err);
          setErrorDropdowns('Failed to load categories or suppliers.');
        } finally {
          setLoadingDropdowns(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Price', parseFloat(price));
    formData.append('Quantity', parseInt(stockQuantity));
    formData.append('Category', category);
    if (supplierId) {
        formData.append('SupplierID', parseInt(supplierId));
    }

    if (imageFile) {
      formData.append('image', imageFile);
    }

    // ✅ onSaveProduct ki bajaye onAddProduct ko call karein
    await onAddProduct(formData, editingProduct ? editingProduct.ID : null);

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{editingProduct ? 'Update Product' : 'Add Product'}</h3>
        {loadingDropdowns && <p>Loading categories and suppliers...</p>}
        {errorDropdowns && <p style={{ color: 'red' }}>{errorDropdowns}</p>}
        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {/* Price */}
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            required
          />
          {/* Stock Quantity */}
          <input
            type="number"
            placeholder="Stock Quantity"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            required
          />

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={loadingDropdowns}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Supplier Dropdown */}
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
            disabled={loadingDropdowns}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((sup) => (
              <option key={sup.SupplierID} value={sup.SupplierID}>
                {sup.Name}
              </option>
            ))}
          </select>

          {/* ✅ Image Upload Field */}
          <label htmlFor="productImage" style={{ marginTop: '15px', display: 'block' }}>Product Image:</label>
          <input
            type="file"
            id="productImage"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
          />
          {existingImageUrl && (
            <div style={{ marginTop: '10px' }}>
              <p>Current Image:</p>
              <img src={existingImageUrl} alt="Current Product" style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ccc' }} />
            </div>
          )}
          {imageFile && (
              <div style={{ marginTop: '10px' }}>
                <p>New Image Preview:</p>
                <img src={URL.createObjectURL(imageFile)} alt="New Product Preview" style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ccc' }} />
              </div>
          )}

          <div className="modal-actions">
            <button type="submit" className="save-btn">
              {editingProduct ? 'Update' : 'Add'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
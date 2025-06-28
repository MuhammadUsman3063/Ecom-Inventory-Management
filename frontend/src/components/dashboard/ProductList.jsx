// ✅ ProductList.jsx

import React, { useState, useEffect } from 'react';
import './ProductList.css';
import ProductModal from './ProductModal';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState(null);
  const productsPerPage = 3;
  const navigate = useNavigate();

  // ✅ Decode JWT and fetch products
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setUserRole(decoded.role);
          fetchProducts(token); // ✅ Fetch data from backend
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  // ✅ Fetch products from API
  const fetchProducts = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      // ✅ Agar error aata hai products fetch karte waqt toh alert dikhayein
      alert("Failed to load products. Please check your internet connection or server status.");
    }
  };

// ✅ Add or Update Product (both handled here)
const handleSaveProduct = async (productData, productId) => { // ✅ Add productId parameter
  const token = localStorage.getItem("token");

  try {
    let response;
    let savedProduct; // To store the actual product object from response

    if (productId) { // ✅ If productId exists, it's an update
      response = await axios.put(
        `http://localhost:5000/api/products/${productId}`, // Use productId from ProductModal
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      savedProduct = response.data; // Update response directly returns updated product
      setProducts((prev) =>
        prev.map((p) => (p.ID === productId ? savedProduct : p))
      );
      alert("Product updated successfully!"); // ✅ Success alert
    } else { // It's a new product creation
      response = await axios.post(
        'http://localhost:5000/api/products',
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // ✅ Fix: Backend returns newProduct directly (not { product: newProduct }) as per our model
      savedProduct = response.data;
      setProducts((prev) => [...prev, savedProduct]);
      alert("Product added successfully!"); // ✅ Success alert
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  } catch (err) {
    console.error("Error saving product:", err.response ? err.response.data : err.message);
    alert(`Failed to save product. ${err.response?.data?.error || err.message}. Please try again.`); // ✅ More descriptive error alert
  }
};

// ✅ Delete Product
const handleDeleteProduct = async (productId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setProducts((prev) => prev.filter((p) => p.ID !== productId));
    alert("Product deleted successfully!"); // ✅ Success alert
  } catch (err) {
    console.error("Error deleting product:", err.response ? err.response.data : err.message);
    alert(`Failed to delete product. ${err.response?.data?.error || err.message}. Please try again.`); // ✅ More descriptive error alert
  }
};

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

const filteredProducts = products.filter((product) => {
  const name = product.Name || '';
  const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = filterCategory === 'All' || product.Category === filterCategory;
  return matchesSearch && matchesCategory;
});

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div className="product-list">
      <div className="product-list-header">
        <h2>Product Management</h2>
        {(userRole === 'admin' || userRole === 'inventory manager') && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="add-product-btn"
          >
            Add Product
          </button>
        )}
      </div>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Categories</option>
          {/* Static options, ideally fetch from backend for dynamic categories */}
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
        </select>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onAddProduct={handleSaveProduct}
        editingProduct={editingProduct}
      />
      <table className="product-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Image</th> {/* ✅ Add Image column header */}
      <th>Name</th>
      <th>Price ($)</th>
      <th>Quantity</th>
      <th>Category</th>
      <th>Supplier</th> {/* ✅ Add Supplier column header */}
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {currentProducts.map((product, index) => (
      <tr
        key={product.ID}
        className={product.Quantity < 5 ? 'low-stock' : ''}
      >
        <td>{indexOfFirstProduct + index + 1}</td>
        <td>
          {/* ✅ Corrected: Use product.Imageurl (small 'u') as per DB column */}
          {product.Imageurl ? (
            <img
              src={`http://localhost:5000${product.Imageurl}`}
              alt={product.Name}
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
            />
          ) : (
            'No Image'
          )}
        </td> {/* ✅ Add Image column data */}
        <td>{product.Name}</td>
        <td>{product.Price}</td>
        <td className={product.Quantity < 5 ? 'low-stock-qty' : ''}>
          {product.Quantity === 0 ? (
            <span className="out-of-stock">Out of Stock</span>
          ) : (
            product.Quantity
          )}
        </td>
        <td>{product.Category}</td>
        {/* ✅ Corrected: Use product.SupplierName. Backend must provide this. */}
        <td>{product.SupplierName || 'N/A'}</td> {/* ✅ Add Supplier column data. */}
        <td>
          {(userRole === 'admin' || userRole === 'inventory manager') && (
            <>
              <button className="edit-btn" onClick={() => handleEditClick(product)}>
                Edit
              </button>
              {userRole === 'admin' && (
                <button className="delete-btn" onClick={() => handleDeleteProduct(product.ID)}>
                  Delete
                </button>
              )}
            </>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {Math.ceil(filteredProducts.length / productsPerPage)}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              prev < Math.ceil(filteredProducts.length / productsPerPage) ? prev + 1 : prev
            )
          }
          disabled={currentPage >= Math.ceil(filteredProducts.length / productsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ProductList;
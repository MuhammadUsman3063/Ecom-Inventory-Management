// customer-frontend/src/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext.jsx';

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
        setError(null);
        console.log('Fetched single product:', response.data);
        // ✅ NEW LINE: Check the exact ImageUrl value
        console.log('Product ImageUrl in Detail Page:', response.data.ImageUrl);
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error('Error fetching product details:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value, 10) || 1);
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${quantity} of ${product.Name} added to cart!`);
    }
  };

  if (loading) {
    return <div className="page-container">Loading product details...</div>;
  }

  if (error) {
    return <div className="page-container" style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!product) {
    return <div className="page-container">Product not found.</div>;
  }

  return (
    <div className="page-container">
      <div className="product-detail-container">
        {product.ImageUrl && (
          <img
            // ✅ CORRECTION: Add backend base URL to ImageUrl
            src={`http://localhost:5000${product.ImageUrl}`}
            alt={product.Name}
          />
        )}
        <div className="product-detail-info">
          <h2>{product.Name}</h2>
          <p className="category">Category: <span style={{ fontWeight: 'bold' }}>{product.Category}</span></p>
          <p className="price">Price: Rs. {product.Price}</p>
          <p className="description">
            {product.Description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'}
          </p>
          <p className="stock">
            **Current Stock:** {product.Quantity} units.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
            <label htmlFor="quantity" style={{ marginRight: '10px', fontWeight: 'bold' }}>Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              style={{ width: '60px', textAlign: 'center' }}
            />
          </div>

          <button
            onClick={handleAddToCart}
            className="success"
          >
            Add to Cart
          </button>
        </div>    
      </div>
    </div>
  );
}

export default ProductDetailPage;
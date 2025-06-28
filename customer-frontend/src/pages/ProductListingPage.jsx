// customer-frontend/src/pages/ProductListingPage.jsx
// ... (imports remain the same)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx'; // Make sure it's .jsx

function ProductListingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

 useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
        setError(null);
        // ✅ NEW LINE: Check the ImageUrl for each product in listing
        response.data.forEach(p => console.log(`Product "${p.Name}" ImageUrl:`, p.ImageUrl));
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.Name} added to cart!`);
  };

  if (loading) {
    return <div className="page-container">Loading products...</div>;
  }

  if (error) {
    return <div className="page-container" style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="page-container">
      <h2>Electronics Products</h2>
      <div className="product-grid">
        {products.length > 0 ? (
          products.map(product => (
            <Link to={`/products/${product.ID}`} key={product.ID} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="product-card">
                {product.ImageUrl && (
                  // ✅ CORRECTION: Add backend base URL to ImageUrl
                  <img src={`http://localhost:5000${product.ImageUrl}`} alt={product.Name} />
                )}
                <h3>{product.Name}</h3>
                <p>Category: {product.Category}</p>
                <p className="price">Rs. {product.Price}</p>
                <button
                  onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                  className="primary"
                  style={{ width: '100%' }}
                >
                  Add to Cart
                </button>
              </div>
            </Link>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
}

export default ProductListingPage;
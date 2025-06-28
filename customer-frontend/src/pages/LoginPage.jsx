// customer-frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ useAuth hook import karein
import './AuthPage.css'; // Common CSS for auth forms (agar aap bana rahe hain)

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ Loading state for form submission

  const { login } = useAuth(); // Auth context se login function

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous messages
    setLoading(true); // Set loading true

    const result = await login(email, password); // AuthContext ke login function ko call karein

    if (result.success) {
      setSuccessMessage(result.message);
      // Login successful hone par customer ke order history page ya home page par redirect karein
      navigate('/orders/history'); // Ya '/home' ya '/'
    } else {
      setError(result.message);
    }
    setLoading(false); // Set loading false
  };

  return (
    <div className="auth-form-container">
      <h2>Customer Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      <p className="auth-link">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

export default LoginPage;
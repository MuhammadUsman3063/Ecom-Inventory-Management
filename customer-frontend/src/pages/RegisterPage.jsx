// customer-frontend/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ useAuth hook import karein
import './AuthPage.css'; // Common CSS for auth forms

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ Loading state for form submission

  const { register } = useAuth(); // Auth context se register function

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous messages
    setLoading(true); // Set loading true

    const result = await register(name, email, password, phone, address); // AuthContext ke register function ko call karein

    if (result.success) {
      setSuccessMessage(result.message);
      // Registration successful hone par login page par redirect karein
      setTimeout(() => {
        navigate('/login');
      }, 2000); // 2 second baad redirect karein
    } else {
      setError(result.message);
    }
    setLoading(false); // Set loading false
  };

  return (
    <div className="auth-form-container">
      <h2>Customer Registration</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your Full Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Your Email Address"
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
            placeholder="Choose a strong password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone (Optional):</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your Phone Number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address (Optional):</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your Delivery Address"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="auth-link">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}

export default RegisterPage;
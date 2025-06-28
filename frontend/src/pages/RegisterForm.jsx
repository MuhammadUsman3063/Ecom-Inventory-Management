import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin', // ✅ Use lowercase matching backend
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      setMessage(res.data.message);

      // After 2 seconds, call parent callback to switch to login form
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        {/* ✅ Role Dropdown */}
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="admin">Admin</option>
          <option value="inventory manager">Inventory Manager</option>
          <option value="sales manager">Sales Manager</option>
          <option value="staff">Staff</option> {/* ✅ New role */}
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;

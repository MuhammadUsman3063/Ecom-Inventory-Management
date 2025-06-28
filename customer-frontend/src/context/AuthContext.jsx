// customer-frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// ✅ Context create karein
export const AuthContext = createContext();

// ✅ AuthProvider component
export const AuthProvider = ({ children }) => {
  // ✅ State for user info aur token
  const [user, setUser] = useState(null); // Will store { id, name, email, role }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for initial check

  // ✅ Component mount hone par ya reload hone par token check karein
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user'); // User info bhi store karein

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false); // Loading complete
  }, []);

  // ✅ Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      // ✅ Role check ki functionality admin login ke liye add ki thi. Customer ke liye direct customer/login use karein.
      const response = await axios.post('http://localhost:5000/api/auth/customer/login', { email, password });
      const { token, user: userData } = response.data;

      // State update karein
      setToken(token);
      setUser(userData);

      // Local storage mein save karein
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setLoading(false);
      return { success: true, message: "Login successful!" };
    } catch (error) {
      setLoading(false);
      console.error("Customer Login Error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed. Please check your credentials.' };
    }
  };

  // ✅ Register function
  const register = async (name, email, password, phone, address) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/customer/register', { name, email, password, phone, address });
      setLoading(false);
      return { success: true, message: response.data.message || "Registration successful! You can now log in." };
    } catch (error) {
      setLoading(false);
      console.error("Customer Register Error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed. Please try again.' };
    }
  };

  // ✅ Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Logout ke baad login page par redirect
  };

  // ✅ NEW FUNCTION: getToken - For making authenticated requests
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // ✅ Value provide karein context ko
  const authContextValue = {
    user,
    token, // Token bhi context mein expose karein agar direct access ki zaroorat ho
    loading,
    login,
    register,
    logout,
    getToken, // ✅ getToken function ko AuthContext value mein include karein
    isAuthenticated: !!token && !!user, // Check if both token and user exist
    isCustomer: user && user.role === 'customer'
  };

  // ✅ Children ko wrap karein Provider ke andar
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook to easily use AuthContext
export const useAuth = () => useContext(AuthContext);
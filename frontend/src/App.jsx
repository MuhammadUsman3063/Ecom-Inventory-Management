import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './pages/RegisterForm';
import DashboardLayout from './components/dashboard/DashboardLayout';
import SummaryCards from './components/dashboard/SummaryCards';
import ProductsPage from './pages/ProductsPage';
import ProductList from './components/dashboard/ProductList';
import OrdersPage from './components/dashboard/OrdersPage';
import InventoryList from './components/dashboard/InventoryList';
import CustomerList from './components/dashboard/CustomerList'; // ✅ Import CustomerList
import SupplierList from './components/dashboard/SupplierList'; // ✅ Import SupplierList

import './App.css';
import './pages/RegisterForm.css';
import './components/dashboard/DashboardLayout.css';
import './components/dashboard/Sidebar.css';
import './components/dashboard/Header.css';
import './components/dashboard/SummaryCards.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Default route: if logged in, go to dashboard, else login */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <>
                <div className="login-container">
                  <LoginForm onLoginSuccess={handleLoginSuccess} />
                  <p style={{ marginTop: '1rem' }}>
                    Don&apos;t have an account?{' '}
                    <a href="/register">Register</a>
                  </p>
                </div>
              </>
            )
          }
        />

        {/* Register route */}
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <>
                <div className="register-container">
                  <RegisterForm />
                  <p style={{ marginTop: '1rem' }}>
                    Already have an account?{' '}
                    <a href="/login">Login</a>
                  </p>
                </div>
              </>
            )
          }
        />

        {/* Protected Dashboard route */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardLayout onLogout={handleLogout}>
                <SummaryCards />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/dashboard/products"
          element={
            isAuthenticated ? (
              <DashboardLayout onLogout={handleLogout}>
                <ProductsPage />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Orders route */}
        <Route
          path="/dashboard/orders"
          element={
            isAuthenticated ? (
              <DashboardLayout onLogout={handleLogout}>
                <OrdersPage />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Inventory route */}
        <Route
          path="/dashboard/inventory"
          element={
            isAuthenticated ? (
              <DashboardLayout onLogout={handleLogout}>
                <InventoryList />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ✅ Customers route - Add this new route */}
        <Route
          path="/dashboard/customers"
          element={
            isAuthenticated ? (
              <DashboardLayout onLogout={handleLogout}>
                <CustomerList /> {/* ✅ Render CustomerList here */}
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


        {/* In your App.jsx */}
<Route
  path="/dashboard/suppliers"
  element={
    isAuthenticated ? (
      <DashboardLayout onLogout={handleLogout}>
        <SupplierList /> {/* ✅ Render SupplierList here */}
      </DashboardLayout>
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
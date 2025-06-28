// customer-frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // ✅ Navigate import karein aur useAuth hook bhi import karein

// ✅ New Imports for Authentication and Cart Context
import { AuthProvider, useAuth } from './context/AuthContext'; // ✅ useAuth ko bhi import karein
import { CartProvider } from './context/CartContext';

// ✅ Existing Components (aapke paas hain)
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage'; // Aapne rename kiya ProductsPage ko
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';

// ✅ New Imports for Login/Register/Order History/Protected Route
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProtectedRoute from './components/ProtectedRoute'; // Protected routes ke liye

// ✅ New Component: InitialRedirect
// Yeh component decide karega ke user kahan redirect ho
function InitialRedirect() {
  const { isAuthenticated, loading } = useAuth(); // AuthContext se state lenge

  if (loading) {
    return <div>Loading authentication...</div>; // Ya koi splash screen, jab tak auth state load na ho
  }

  // Agar user authenticated hai, toh usko HomePage par bhej dein
  if (isAuthenticated) {
    return <Navigate to="/home" replace />; // ✅ Note: HomePage ko ab /home par shift kar diya hai
  }

  // Agar authenticated nahi hai, toh Login page par bhej dein
  return <Navigate to="/login" replace />;
}


function App() {
  return (
    <BrowserRouter>
      {/* ✅ AuthProvider aur CartProvider se wrap karein poori app ko */}
      <AuthProvider>
        <CartProvider>
          <div>
            <Navbar />
            <Routes>
              {/* ✅ Change 1: Root path "/" par InitialRedirect component */}
              <Route path="/" element={<InitialRedirect />} />

              {/* ✅ Change 2: HomePage ko ab "/home" path par move kar dein aur protect karein */}
              {/* Yeh route sirf logged-in customers access kar sakenge */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <HomePage />
                  </ProtectedRoute>
                }
              />

              {/* ✅ Change 3: ProductsPage, ProductDetailPage, CartPage ko bhi protect karein */}
              <Route
                path="/products"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <ProductListingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <ProductDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CartPage />
                  </ProtectedRoute>
                }
              />

              {/* Login aur Register pages ko Protect nahi karenge, taaki koi bhi unko access kar sake */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Order History pehle se protected hai */}
              <Route
                path="/orders/history"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Aapke doosre routes yahan add ho sakte hain */}
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
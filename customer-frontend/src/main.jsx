// customer-frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CartProvider } from './context/CartContext.jsx'; // ✅ Import CartProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider> {/* ✅ App component ko CartProvider se wrap kiya */}
      <App />
    </CartProvider>
  </React.StrictMode>,
);
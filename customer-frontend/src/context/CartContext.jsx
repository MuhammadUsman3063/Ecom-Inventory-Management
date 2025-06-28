// customer-frontend/src/context/CartContext.js (create a 'context' folder inside src)
// Ya agar aap src folder ke andar rakhna chahte hain, toh 'customer-frontend/src/CartContext.js'

import React, { createContext, useState, useEffect, useContext } from 'react';

// Usman, is point mein jo samajhne wali baat hai woh hai 'React Context API'.
// 'Context API' React mein data ko components ke darmiyan share karne ka ek tareeqa hai
// baghair props ko har level par manually pass kiye (prop drilling se bachne ke liye).
// 'createContext' do cheezein deta hai: Provider aur Consumer.
export const CartContext = createContext();

// 'CartProvider' woh component hai jo cart ki state ko manage karega
// aur use apne children components ko available karayega.
export const CartProvider = ({ children }) => {
  // 'useState' cart items ko store karega. Initial state local storage se load hogi.
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localCart = localStorage.getItem('cartItems');
      // Usman, is point mein jo samajhne wali baat hai woh hai 'Local Storage'.
      // 'Local Storage' browser mein data store karne ka ek tareeqa hai jo session khatam hone par bhi rehta hai.
      // Hum isko cart items ko persist karne ke liye use kar rahe hain, taaki user page refresh kare
      // ya browser close kare toh cart empty na ho.
      return localCart ? JSON.parse(localCart) : [];
    } catch (e) {
      console.error("Failed to parse cart items from local storage", e);
      return [];
    }
  });

  // 'useEffect' cartItems mein changes ko local storage mein save karega.
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart items to local storage", e);
    }
  }, [cartItems]); // 'cartItems' dependency array mein hai taaki jab bhi cartItems change ho, effect chale.

  // 'addToCart' function product ko cart mein add karegi.
  const addToCart = (product, quantity = 1) => {
    // Usman, is point mein jo samajhne wali baat hai woh hai 'Immutability'.
    // React mein state ko direct modify nahi karte, balki naya state object banate hain.
    // Yahan hum newCartItems array bana rahe hain.
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.ID === product.ID);

      if (existingItem) {
        // Agar item pehle se cart mein hai, toh quantity update karo
        return prevItems.map(item =>
          item.ID === product.ID ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // Agar item naya hai, toh add karo
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // 'removeFromCart' function product ko cart se remove karegi.
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.ID !== productId));
  };

  // 'updateQuantity' function item ki quantity update karegi.
  const updateQuantity = (productId, newQuantity) => {
    setCartItems(prevItems => {
      if (newQuantity <= 0) { // Agar quantity 0 ya usse kam ho toh remove kar do
        return prevItems.filter(item => item.ID !== productId);
      }
      return prevItems.map(item =>
        item.ID === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // ✅ NEW: 'clearCart' function to empty the cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Context Provider value prop ke zariye cart state aur functions ko provide karta hai.
  // ✅ clearCart ko bhi value mein include karein
  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Usman, is point mein jo samajhne wali baat hai woh hai 'Custom Hook - useContext'.
// 'useCart' hook dusre components ko asani se cart context ko access karne deta hai.
export const useCart = () => useContext(CartContext);
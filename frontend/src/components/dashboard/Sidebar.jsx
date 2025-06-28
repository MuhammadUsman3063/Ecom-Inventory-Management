import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <h2>Inventory Panel</h2>
      <ul>
        <li>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? 'active-link' : ''}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/dashboard/products" 
            className={({ isActive }) => isActive ? 'active-link' : ''}
          >
            Products
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/dashboard/orders" 
            className={({ isActive }) => isActive ? 'active-link' : ''}
          >
            Orders
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/dashboard/inventory" 
            className={({ isActive }) => isActive ? 'active-link' : ''}
          >
            Inventory
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/dashboard/customers" 
            className={({ isActive }) => isActive ? 'active-link' : ''}
          >
            Customers
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/dashboard/suppliers" 
            className={({ isActive }) => isActive ? 'active-link' : ''}
          >
            Suppliers
          </NavLink>
        </li>
       
      </ul>
    </div>
  );
}

export default Sidebar;

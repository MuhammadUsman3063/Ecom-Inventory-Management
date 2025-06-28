import React from 'react';
import './Header.css';

function Header({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('user'));

 return (
    <header className="dashboard-header">
      <div>
        <h3>Welcome, {user?.name || 'User'}</h3>
        <span>Role: {user?.role || 'N/A'}</span>
      </div>
      <button className="logout-btn" onClick={onLogout}>
        🔓 Logout
      </button>
    </header>
  );
}

export default Header;





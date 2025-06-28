import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './DashboardLayout.css';

function DashboardLayout({ children, onLogout }) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar with navigation */}
      <Sidebar />

      {/* Main area with header and content */}
      <div className="main-content">
        <Header onLogout={onLogout} />

        {/* Page-specific content renders here */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;

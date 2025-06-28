import React from 'react';
import './summaryCards.css'; // Agar styling file banayi hai to

function SummaryCards() {
  // Ye sirf static mock data hai. Baad me database se dynamic karenge.
  const summary = [
    { title: 'Total Products', value: 120, icon: '📦' },
    { title: 'Total Orders', value: 350, icon: '🛒' },
    { title: 'Total Customers', value: 87, icon: '👥' },
    { title: 'Total Suppliers', value: 15, icon: '🏢' },
  ];

  return (
    <div className="summary-cards-container">
      {summary.map((card, index) => (
        <div className="summary-card" key={index}>
          <div className="card-icon">{card.icon}</div>
          <div className="card-info">
            <h3>{card.value}</h3>
            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;

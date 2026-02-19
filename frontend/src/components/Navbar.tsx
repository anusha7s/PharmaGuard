import React from 'react';

const Navbar: React.FC = () => (
  <nav className="navbar" role="navigation" aria-label="Main navigation">
    <div className="nav-logo">
      <div className="nav-logo-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <path d="M16 3L5 7.5V15c0 6 4.5 11.6 11 13 6.5-1.4 11-7 11-13V7.5L16 3z" fill="white" opacity="0.95"/>
          <path d="M12 15.5l3 3 5-5" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="nav-logo-text">
        <h1>PharmaGuard</h1>
        <p>Pharmacogenomic Risk Prediction</p>
      </div>
    </div>
    <div className="nav-pills" aria-label="Platform features">
      <span className="nav-pill">Precision Medicine</span>
      <span className="nav-pill">Explainable AI</span>
      <span className="nav-pill">CPIC-Aligned</span>
    </div>
  </nav>
);

export default Navbar;

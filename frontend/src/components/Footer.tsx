import React from 'react';

const Footer: React.FC = () => (
  <footer className="footer" role="contentinfo">
    <div className="footer-inner">
      <div className="footer-left">
        <span className="footer-logo">🛡️ PharmaGuard</span>
        <span className="footer-sep">·</span>
        <span className="footer-tagline">Pharmacogenomic Risk Prediction System</span>
      </div>
      <div className="footer-right">
        <span className="footer-badge">CPIC Aligned</span>
        <span className="footer-badge">PharmGKB</span>
        <span className="footer-badge">FDA Approved Biomarkers</span>
      </div>
    </div>
  </footer>
);

export default Footer;

import React from 'react';

interface AnalyzeButtonProps {
  disabled: boolean;
  onClick: () => void;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ disabled, onClick }) => (
  <button
    className="run-btn"
    disabled={disabled}
    onClick={onClick}
    aria-label="Run pharmacogenomic analysis"
  >
    <span className="btn-pulse" aria-hidden="true">🛡</span>
    Run Pharmacogenomic Analysis &nbsp;›
  </button>
);

export default AnalyzeButton;

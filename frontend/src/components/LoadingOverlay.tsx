import React from 'react';

interface LoadingOverlayProps {
  step: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ step }) => (
  <div className="loading-overlay" role="status" aria-label="Analyzing genomic profile">
    <div className="loading-card">
      {/* DNA Helix */}
      <div className="dna-container" aria-hidden="true">
        {[...Array(7)].map((_, i) => (
          <div key={i} className={`dna-dot dna-dot--${i + 1}`} />
        ))}
      </div>
      <div className="loading-title">Analyzing Genomic Profile…</div>
      <div className="loading-text">Parsing variants and computing risk assessments</div>
      <div className="loading-step" aria-live="polite">{step}</div>
    </div>
  </div>
);

export default LoadingOverlay;

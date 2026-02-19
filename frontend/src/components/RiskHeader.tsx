import React, { useEffect, useState } from 'react';
import type { AnalysisResult } from '../types';

interface RiskHeaderProps {
  result: AnalysisResult;
  onCopyJSON: () => void;
  onDownloadJSON: () => void;
}

const RISK_ICONS: Record<string, string> = { green: '✅', orange: '⚠️', red: '🚫' };
const SEV_PCT: Record<string, number> = { none: 4, low: 22, moderate: 48, high: 74, critical: 96 };

const RiskHeader: React.FC<RiskHeaderProps> = ({ result, onCopyJSON, onDownloadJSON }) => {
  const [confDisplay, setConfDisplay] = useState(0);
  const [sevWidth, setSevWidth] = useState(0);
  const c = result.risk_assessment.color;
  const pct = Math.round(result.risk_assessment.confidence_score * 100);
  const sevPct = SEV_PCT[result.risk_assessment.severity] ?? 4;
  const sevLabel = result.risk_assessment.severity.charAt(0).toUpperCase() + result.risk_assessment.severity.slice(1);

  useEffect(() => {
    const timer = setTimeout(() => { setSevWidth(sevPct); }, 150);
    let n = 0;
    const iv = setInterval(() => {
      n += 2;
      setConfDisplay(Math.min(n, pct));
      if (n >= pct) clearInterval(iv);
    }, 16);
    return () => { clearTimeout(timer); clearInterval(iv); };
  }, [pct, sevPct]);

  return (
    <>
      {/* Top bar */}
      <div className="result-top">
        <div className={`risk-icon ${c}`} aria-hidden="true">
          {RISK_ICONS[c] ?? '⚠️'}
        </div>
        <div className="result-info">
          <div>
            <span className={`result-risk-label ${c}`}>
              {result.risk_assessment.risk_label}
            </span>
            <span className="result-drug-badge">{result.drug}</span>
          </div>
          <div className="result-meta">
            Patient <strong>{result.patient_id}</strong> · {new Date(result.timestamp).toLocaleString()}
          </div>
        </div>
        <div className="result-actions">
          <button className="action-btn" onClick={onCopyJSON} aria-label="Copy JSON to clipboard">
            📋 Copy JSON
          </button>
          <button className="action-btn" onClick={onDownloadJSON} aria-label="Download JSON file">
            ⬇ Download JSON
          </button>
        </div>
      </div>

      {/* Severity + Confidence */}
      <div className="severity-section">
        <div className="severity-left">
          <div className="severity-label-row">
            <span className="severity-label">Severity</span>
            <span className="severity-value">{sevLabel}</span>
          </div>
          <div className="severity-bar-bg" role="progressbar" aria-valuenow={sevPct} aria-valuemin={0} aria-valuemax={100}>
            <div className={`severity-bar-fill ${c}`} style={{ width: `${sevWidth}%` }} />
          </div>
        </div>
        <div className="confidence-block">
          <div className="confidence-label">Confidence</div>
          <div className={`confidence-value ${c}`} aria-label={`${pct}% confidence`}>
            {confDisplay}%
          </div>
        </div>
      </div>
    </>
  );
};

export default RiskHeader;

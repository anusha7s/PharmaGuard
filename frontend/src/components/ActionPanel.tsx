import React, { useEffect, useState } from 'react';
import type { QualityMetrics } from '../types';

interface ActionPanelProps {
  metrics: QualityMetrics;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ metrics }) => {
  const [compWidth, setCompWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(
      () => setCompWidth(Math.round(metrics.data_completeness * 100)),
      200
    );
    return () => clearTimeout(t);
  }, [metrics.data_completeness]);

  return (
    <>
      {/* Quality Metrics */}
      <div className="accordion-body">
        <div className="metric-row">
          <span className="metric-key">VCF Parsing</span>
          <span className="metric-success">✓ Success</span>
        </div>

        <div className="metric-row">
          <span className="metric-key">Variants Detected</span>
          <span className="metric-val">
            {metrics.variants_detected}
          </span>
        </div>

        <div className="metric-row">
          <span className="metric-key">Genes Analyzed</span>
          <span className="metric-val metric-val--small">
            {metrics.genes_analyzed}
          </span>
        </div>

        <div className="metric-row">
          <span className="metric-key">Confidence Basis</span>
          <span className="metric-val">
            {metrics.confidence_basis}
          </span>
        </div>

        <div className="metric-row">
          <span className="metric-key">Data Completeness</span>
          <div className="completeness-wrap">
            <div
              className="completeness-bar-bg"
              role="progressbar"
              aria-valuenow={compWidth}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="completeness-bar-fill"
                style={{ width: `${compWidth}%` }}
              />
            </div>
            <span className="metric-val">
              {Math.round(metrics.data_completeness * 100)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActionPanel;

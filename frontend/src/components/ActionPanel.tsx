import React, { useEffect, useState } from 'react';
import type { QualityMetrics } from '../types';

interface ActionPanelProps {
  jsonOutput: string;
  metrics: QualityMetrics;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ jsonOutput, metrics }) => {
  const [compWidth, setCompWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setCompWidth(Math.round(metrics.data_completeness * 100)), 200);
    return () => clearTimeout(t);
  }, [metrics.data_completeness]);

  // const highlighted = syntaxHighlight(jsonOutput);

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
          <span className="metric-val">{metrics.variants_detected}</span>
        </div>
        <div className="metric-row">
          <span className="metric-key">Genes Analyzed</span>
          <span className="metric-val metric-val--small">{metrics.genes_analyzed}</span>
        </div>
        <div className="metric-row">
          <span className="metric-key">Confidence Basis</span>
          <span className="metric-val">{metrics.confidence_basis}</span>
        </div>
        <div className="metric-row">
          <span className="metric-key">Data Completeness</span>
          <div className="completeness-wrap">
            <div className="completeness-bar-bg" role="progressbar" aria-valuenow={compWidth} aria-valuemin={0} aria-valuemax={100}>
              <div className="completeness-bar-fill" style={{ width: `${compWidth}%` }} />
            </div>
            <span className="metric-val">{Math.round(metrics.data_completeness * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Raw JSON
      <div className="accordion-body">
        <div
          className="json-box"
          role="region"
          aria-label="Raw JSON output"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div> */}
    </>
  );
};

// function syntaxHighlight(json: string): string {
//   return json
//     .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
//     .replace(
//       /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
//       (match) => {
//         let cls = 'json-num';
//         if (/^"/.test(match)) cls = /:$/.test(match) ? 'json-key' : 'json-str';
//         else if (/true|false/.test(match)) cls = 'json-bool';
//         else if (/null/.test(match)) cls = 'json-null';
//         return `<span class="${cls}">${match}</span>`;
//       }
//     );
// }

export default ActionPanel;

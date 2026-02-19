import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import RiskHeader from './RiskHeader';
import GenomicProfile from './GenomicProfile';
import ExplanationBlock from './ExplanationBlock';
import ActionPanel from './ActionPanel';

interface ResultsDashboardProps {
  results: AnalysisResult[];
  activeTab: number;
  onTabChange: (i: number) => void;
  onCopyJSON: (result: AnalysisResult) => void;
  onDownloadJSON: (result: AnalysisResult) => void;
}

const RISK_ICONS: Record<string, string> = { green: '✅', orange: '⚠️', red: '🚫' };
const BADGE_STYLES: Record<string, React.CSSProperties> = {
  orange: { background: 'var(--orange-bg)', borderColor: '#fbbf24', color: 'var(--orange)', border: '1.5px solid #fbbf24' },
  green:  { background: 'var(--green-bg)',  borderColor: '#a7f3d0', color: 'var(--green)',  border: '1.5px solid #a7f3d0' },
  red:    { background: 'var(--red-bg)',    borderColor: '#fca5a5', color: 'var(--red)',    border: '1.5px solid #fca5a5' },
};

interface AccordionProps {
  id: string;
  icon: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ id, icon, title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <div
        className="accordion-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`acc-body-${id}`}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
      >
        <div className="accordion-title">
          <span className="accordion-icon" aria-hidden="true">{icon}</span>
          {title}
        </div>
        <span className={`accordion-toggle${open ? ' open' : ''}`} aria-hidden="true">▼</span>
      </div>
      {open && <div id={`acc-body-${id}`}>{children}</div>}
    </div>
  );
};

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, activeTab, onTabChange, onCopyJSON, onDownloadJSON }) => {
  const r = results[activeTab];
  const c = r.risk_assessment.color;
  const jsonStr = JSON.stringify(r, null, 2);

  const handleCopy = () => {
    onCopyJSON(r);
  };

  const handleDownload = () => {
    onDownloadJSON(r);
  };

  return (
    <div>
      {/* Header row */}
      <div className="results-header">
        <div className="results-title">
          Analysis Results{' '}
          <span className="results-count">({results.length} drug{results.length > 1 ? 's' : ''})</span>
        </div>
        <div className="risk-summary-badge" style={BADGE_STYLES[c] ?? BADGE_STYLES.orange}>
          {r.drug} <span className="sep">·</span> {r.risk_assessment.risk_label}
        </div>
      </div>

      {/* Drug tabs (multi-drug) */}
      {results.length > 1 && (
        <div className="drug-tabs" role="tablist" aria-label="Drug results">
          {results.map((res, i) => (
            <button
              key={res.drug}
              className={`drug-tab${i === activeTab ? ' active' : ''}`}
              role="tab"
              aria-selected={i === activeTab}
              onClick={() => onTabChange(i)}
            >
              {RISK_ICONS[res.risk_assessment.color] ?? '⚠️'} {res.drug}
            </button>
          ))}
        </div>
      )}

      {/* Result card */}
      <div className="result-card" role="tabpanel" key={r.drug}>

        {/* Risk Header + Severity Bar */}
        <RiskHeader
          result={r}
          onCopyJSON={handleCopy}
          onDownloadJSON={handleDownload}
        />

        {/* Pharmacogenomic Profile */}
        <Accordion id="pgx" icon="✦" title="Pharmacogenomic Profile" defaultOpen>
          <GenomicProfile profile={r.pharmacogenomic_profile} riskColor={c} />
        </Accordion>

        {/* Clinical Recommendation */}
        <Accordion id="clin" icon="⚕" title="Clinical Recommendation" defaultOpen>
          <div className="accordion-body">
            <div className="rec-action-box">
              <div className="rec-action-title">RECOMMENDED ACTION</div>
              <div className="rec-action-text">{r.clinical_recommendation.recommended_action}</div>
            </div>
            <div className="rec-row">
              <span className="rec-key">Dosing Adjustment</span>
              <span className="rec-val">{r.clinical_recommendation.dosing_adjustment}</span>
            </div>
            <div className="rec-row">
              <span className="rec-key">Urgency</span>
              <span className={`rec-val ${r.clinical_recommendation.urgency === 'Routine' ? 'green' : r.clinical_recommendation.urgency === 'Urgent' ? 'red' : 'orange'}`}>
                {r.clinical_recommendation.urgency}
              </span>
            </div>
            <div className="rec-row">
              <span className="rec-key">Alternative Drugs</span>
              {r.clinical_recommendation.alternative_drugs.length > 0 ? (
                <div className="alt-drugs">
                  {r.clinical_recommendation.alternative_drugs.map(d => (
                    <span key={d} className="alt-drug-tag">{d}</span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>None recommended</span>
              )}
            </div>
            <div className="monitoring-box">
              <div className="monitoring-title">Monitoring Required</div>
              <div className="monitoring-text">{r.clinical_recommendation.monitoring}</div>
            </div>
            <div className="guideline-link">
              Guideline: <span>{r.clinical_recommendation.guideline_reference}</span>
            </div>
          </div>
        </Accordion>

        {/* AI Explanation */}
        <Accordion id="ai" icon="🧠" title="AI-Generated Clinical Explanation">
          <ExplanationBlock explanation={r.llm_explanation} />
        </Accordion>

        {/* Quality Metrics */}
        <Accordion id="qm" icon="📊" title="Quality Metrics">
          <ActionPanel metrics={r.quality_metrics} />
        </Accordion>

        {/* Raw JSON */}
        <Accordion id="json" icon="🧪" title="Raw JSON Output">
          <div className="accordion-body">
            <div
              className="json-box"
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonStr) }}
            />
          </div>
        </Accordion>
      </div>
    </div>
  );
};

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-num';
        if (/^"/.test(match)) cls = /:$/.test(match) ? 'json-key' : 'json-str';
        else if (/true|false/.test(match)) cls = 'json-bool';
        else if (/null/.test(match)) cls = 'json-null';
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

export default ResultsDashboard;

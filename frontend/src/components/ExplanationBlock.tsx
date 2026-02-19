import React, { useState } from 'react';
import type { LLMExplanation } from '../types';
import { useTypewriter } from '../hooks/useTypewriter';

interface ExplanationBlockProps {
  explanation: LLMExplanation;
}

const ExplanationBlock: React.FC<ExplanationBlockProps> = ({ explanation }) => {
  const [started, setStarted] = useState(false);
  const { displayed, done } = useTypewriter(explanation.summary, 20, started);

  return (
    <div className="accordion-body">
      {/* Summary with typewriter */}
      <div className="summary-box">
        <div className="summary-label">SUMMARY</div>
        <div className="summary-text" aria-live="polite">
          {started ? displayed : explanation.summary}
          {started && !done && <span className="typewriter-cursor" aria-hidden="true" />}
          {!started && (
            <button
              className="replay-btn"
              onClick={() => setStarted(true)}
              aria-label="Replay typewriter animation"
            >
              ▶ Replay
            </button>
          )}
        </div>
      </div>

      <div className="bio-section">
        <div className="bio-title">BIOLOGICAL MECHANISM</div>
        <div className="bio-text">{explanation.biological_mechanism}</div>
      </div>

      <div className="bio-section">
        <div className="bio-title">VARIANT IMPACT</div>
        <div className="bio-text">{explanation.variant_impact}</div>
      </div>

      <div className="bio-section">
        <div className="bio-title">CLINICAL CONTEXT</div>
        <div className="bio-text">{explanation.clinical_context}</div>
      </div>

      <div className="evidence-badge">🔵 {explanation.evidence_level}</div>
    </div>
  );
};

export default ExplanationBlock;

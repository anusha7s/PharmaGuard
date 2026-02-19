import React, { useState } from 'react';
import GlassCard from './GlassCard';

const SUPPORTED_DRUGS = [
  { value: 'CODEINE',      label: 'CODEINE — CYP2D6' },
  { value: 'WARFARIN',     label: 'WARFARIN — CYP2C9/CYP2C19' },
  { value: 'CLOPIDOGREL',  label: 'CLOPIDOGREL — CYP2C19' },
  { value: 'SIMVASTATIN',  label: 'SIMVASTATIN — SLCO1B1' },
  { value: 'AZATHIOPRINE', label: 'AZATHIOPRINE — TPMT' },
  { value: 'FLUOROURACIL', label: 'FLUOROURACIL — DPYD' },
];

const GENE_MAP: Record<string, string> = {
  CODEINE: 'CYP2D6', WARFARIN: 'CYP2C9', CLOPIDOGREL: 'CYP2C19',
  SIMVASTATIN: 'SLCO1B1', AZATHIOPRINE: 'TPMT', FLUOROURACIL: 'DPYD',
};

interface DrugInputProps {
  selectedDrugs: string[];
  onAdd: (drug: string) => void;
  onRemove: (drug: string) => void;
}

const DrugInput: React.FC<DrugInputProps> = ({ selectedDrugs, onAdd, onRemove }) => {
  const [customDrug, setCustomDrug] = useState('');

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && !selectedDrugs.includes(val)) onAdd(val);
    e.target.value = '';
  };

  const handleAddCustom = () => {
    const val = customDrug.trim().toUpperCase();
    if (val && !selectedDrugs.includes(val)) { onAdd(val); setCustomDrug(''); }
  };

  const n = selectedDrugs.length;
  const placeholder = n > 0 ? `Add another drug (${n} selected)` : '— Select a supported drug —';

  return (
    <GlassCard style={{ animationDelay: '0.18s' }}>
      <div className="card-body">
        <div className="step-header">
          <div className="step-title">
            <div className="step-num" aria-hidden="true">2</div>
            Select Drug(s)
          </div>
        </div>

        {/* Drug pills */}
        {selectedDrugs.length > 0 && (
          <div className="drug-tags" role="list" aria-label="Selected drugs">
            {selectedDrugs.map(drug => (
              <span key={drug} className="drug-tag" role="listitem">
                🔗 {drug}{GENE_MAP[drug] ? ` — ${GENE_MAP[drug]}` : ''}
                <button
                  className="drug-tag-remove"
                  onClick={() => onRemove(drug)}
                  aria-label={`Remove ${drug}`}
                >✕</button>
              </span>
            ))}
          </div>
        )}

        {/* Dropdown */}
        <div className="drug-select-wrapper">
          <select
            className="drug-select"
            onChange={handleSelect}
            aria-label="Select a supported drug"
            defaultValue=""
          >
            <option value="" disabled>{placeholder}</option>
            {SUPPORTED_DRUGS.map(d => (
              <option
                key={d.value}
                value={d.value}
                disabled={selectedDrugs.includes(d.value)}
              >
                {selectedDrugs.includes(d.value) ? `✓ ${d.label}` : d.label}
              </option>
            ))}
          </select>
          <span className="drug-select-arrow" aria-hidden="true">▾</span>
          {n > 0 && (
            <span className="drug-count-badge" aria-live="polite">
              {n} selected
            </span>
          )}
        </div>

        {/* Custom drug */}
        <div className="custom-drug-row">
          <input
            type="text"
            className="custom-drug-input"
            value={customDrug}
            onChange={e => setCustomDrug(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            placeholder="Or type a custom drug name and press Enter"
            aria-label="Custom drug name"
          />
          <button className="add-btn" onClick={handleAddCustom} aria-label="Add custom drug">
            Add
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default DrugInput;

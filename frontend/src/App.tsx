import React, { useState, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DragDropZone from './components/DragDropZone';
import DrugInput from './components/DrugInput';
import AnalyzeButton from './components/AnalyzeButton';
import ResultsDashboard from './components/ResultsDashboard';
import LoadingOverlay from './components/LoadingOverlay';
import GlassCard from './components/GlassCard';
import { analyzeVCF, SAMPLE_VCF } from './services/pgxService';
import type { AnalysisResult } from './types';
import './index.css';

const LOADING_STEPS = [
  'Initializing VCF parser…',
  'Scanning pharmacogenomic variants…',
  'Matching star alleles to database…',
  'Computing activity scores…',
  'Running CPIC risk matrix…',
  'Generating AI explanations…',
  'Finalizing report…',
];

const GENE_PILLS = [
  { label: 'CYP2D6',  color: 'blue'   },
  { label: 'CYP2C19', color: 'teal'   },
  { label: 'CYP2C9',  color: 'green'  },
  { label: 'SLCO1B1', color: 'purple' },
  { label: 'TPMT',    color: 'orange' },
  { label: 'DPYD',    color: 'pink'   },
];

interface Toast { id: number; message: string; icon: string; }

const App: React.FC = () => {
  const [vcfContent, setVcfContent]   = useState<string | null>(null);
  const [vcfFileName, setVcfFileName] = useState<string | null>(null);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [results, setResults]         = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab]     = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(LOADING_STEPS[0]);
  const [toasts, setToasts]           = useState<Toast[]>([]);
  const toastId = useRef(0);

  // Animate loading steps
  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startLoadingAnim = () => {
    let i = 0;
    stepRef.current = setInterval(() => {
      setLoadingStep(LOADING_STEPS[i] ?? LOADING_STEPS[LOADING_STEPS.length - 1]);
      i++;
      if (i >= LOADING_STEPS.length && stepRef.current) clearInterval(stepRef.current);
    }, 300);
  };

  const showToast = useCallback((message: string, icon = '✓') => {
    const id = toastId.current++;
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2700);
  }, []);

  // Handlers
  const handleFile = (content: string, fileName: string) => {
    setVcfContent(content);
    setVcfFileName(fileName);
  };

  const handleRemoveFile = () => {
    setVcfContent(null);
    setVcfFileName(null);
  };

  // Fix: Load Sample does NOT auto-select any drug
  const handleLoadSample = () => {
    setVcfContent(SAMPLE_VCF);
    setVcfFileName('sample_patient_PATIENT_047.vcf');
    showToast('Sample VCF loaded! Now select your drug(s).', '📄');
  };

  const handleDemoMode = () => {
    setVcfContent(SAMPLE_VCF);
    setVcfFileName('sample_patient_PATIENT_047.vcf');
    const all = ['CODEINE','WARFARIN','CLOPIDOGREL','SIMVASTATIN','AZATHIOPRINE','FLUOROURACIL'];
    setSelectedDrugs(all);
    showToast('Demo mode: all 6 drugs loaded!', '✨');
  };

  const handleAddDrug = (drug: string) => {
    setSelectedDrugs(prev => prev.includes(drug) ? prev : [...prev, drug]);
  };

  const handleRemoveDrug = (drug: string) => {
    setSelectedDrugs(prev => prev.filter(d => d !== drug));
  };

  const handleRun = async () => {
    if (!vcfContent || selectedDrugs.length === 0) return;
    setIsAnalyzing(true);
    startLoadingAnim();

    try {
      const newResults = await analyzeVCF(vcfContent, vcfFileName || 'data.vcf', selectedDrugs);
      setResults(newResults);
      setActiveTab(0);
      showToast('Analysis complete!', '✅');
    } catch (e: any) {
      showToast(e.message || 'Analysis failed', '❌');
    } finally {
      setIsAnalyzing(false);
      if (stepRef.current) clearInterval(stepRef.current);
      setLoadingStep(LOADING_STEPS[LOADING_STEPS.length - 1]);
    }
  };

  // Clipboard + Download
  const handleCopyJSON = useCallback((result: AnalysisResult) => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      .then(() => showToast('JSON copied to clipboard!', '📋'));
  }, [showToast]);

  const handleDownloadJSON = useCallback((result: AnalysisResult) => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pharma_guard_${result.patient_id}_${result.drug}.json`;
    a.click();
    showToast('JSON downloaded!', '⬇');
  }, [showToast]);

  const canRun = Boolean(vcfContent) && selectedDrugs.length > 0;

  return (
    <div className="app">
      {/* Animated background orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <Navbar />

      {/* HERO */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-badge">✦ Precision Medicine · Explainable AI · CPIC-Aligned</div>
        <h2 id="hero-heading">
          Predict Drug Risks from{' '}
          <span className="gradient-text">Genetic<br />Variants</span>
        </h2>
        <p>
          Upload a VCF file to analyze pharmacogenomic variants across 6 critical genes.
          Get personalized risk predictions with AI-generated clinical explanations aligned to CPIC guidelines.
        </p>
        <div className="stats-row" role="list">
          <div className="stat-item" role="listitem"><div className="stat-num blue">6</div><div className="stat-label">Genes Analyzed</div></div>
          <div className="stat-item" role="listitem"><div className="stat-num blue">6</div><div className="stat-label">Supported Drugs</div></div>
          <div className="stat-item" role="listitem"><div className="stat-num purple">CPIC</div><div className="stat-label">Guideline Aligned</div></div>
          <div className="stat-item" role="listitem"><div className="stat-num dark">5</div><div className="stat-label">Risk Categories</div></div>
        </div>
        <div className="gene-pills" role="list" aria-label="Supported genes">
          {GENE_PILLS.map(g => (
            <span key={g.label} className={`gene-pill ${g.color}`} role="listitem">✦ {g.label}</span>
          ))}
        </div>
      </section>

      {/* MAIN */}
      <main className="main-content">
        {/* LEFT */}
        <aside className="left-panel" aria-label="Analysis controls">
          {/* Step 1 */}
          <DragDropZone
            onFile={handleFile}
            onLoadSample={handleLoadSample}
            fileName={vcfFileName}
            onRemove={handleRemoveFile}
          />

          {/* Step 2 */}
          <DrugInput
            selectedDrugs={selectedDrugs}
            onAdd={handleAddDrug}
            onRemove={handleRemoveDrug}
          />

          {/* Run Button */}
          <div style={{ animation: 'fadeUp 0.4s ease 0.26s both' }}>
            <AnalyzeButton disabled={!canRun} onClick={handleRun} />
          </div>

          {/* Demo Mode */}
          <button
            className="demo-mode-btn"
            onClick={handleDemoMode}
            style={{ animation: 'fadeUp 0.4s ease 0.32s both' }}
            aria-label="Load demo with all 6 drugs"
          >
            ✨ Demo Mode — Analyze All 6 Drugs Instantly
          </button>

          {/* How it Works */}
          <GlassCard style={{ animation: 'fadeUp 0.4s ease 0.4s both' }}>
            <div className="card-body">
              <div className="section-label">HOW IT WORKS</div>
              <ul className="how-list" aria-label="Analysis steps">
                {[
                  ['Parse VCF', 'Extract pharmacogenomic variants from standard VCF format'],
                  ['Identify Alleles', 'Match rsIDs to known star alleles across 6 PGx genes'],
                  ['Predict Phenotype', 'Calculate activity score → PM / IM / NM / RM / URM'],
                  ['Risk Assessment', 'Apply CPIC-aligned drug-phenotype matrix'],
                  ['Generate Explanation', 'AI-powered clinical summary with variant citations'],
                ].map(([strong, text]) => (
                  <li key={strong} className="how-item">
                    <span className="how-dot" aria-hidden="true" />
                    <span>
                      <span className="how-strong">{strong}</span>
                      {' — '}
                      <span className="how-text">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </aside>

        {/* RIGHT */}
        <section aria-label="Analysis results">
          {results.length === 0 ? (
            <div className="empty-state" style={{ animation: 'fadeUp 0.4s ease 0.2s both' }}>
              <span className="empty-dna" aria-hidden="true">🧬</span>
              <div className="empty-title">Ready to Analyze</div>
              <p className="empty-text">
                Upload your VCF file and select one or more drugs to generate a personalized pharmacogenomic risk report.
              </p>
              <div className="empty-steps">
                {['Upload a .vcf file or click "Load Sample"', 'Select one or more drugs to analyze', 'Click "Run Analysis" to see your report'].map((s, i) => (
                  <div key={i} className="empty-step">
                    <span className="empty-step-num">{i + 1}</span>{s}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ResultsDashboard
              results={results}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCopyJSON={handleCopyJSON}
              onDownloadJSON={handleDownloadJSON}
            />
          )}
        </section>
      </main>

      <Footer />

      {/* Loading overlay */}
      {isAnalyzing && <LoadingOverlay step={loadingStep} />}

      {/* Toasts */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.icon} {t.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

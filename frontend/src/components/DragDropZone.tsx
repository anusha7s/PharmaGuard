import React, { useRef, useState } from 'react';
import GlassCard from './GlassCard';

interface DragDropZoneProps {
  onFile: (content: string, fileName: string) => void;
  onLoadSample: () => void;
  fileName: string | null;
  onRemove: () => void;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({ onFile, onLoadSample, fileName, onRemove }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.vcf') && file.type !== 'text/plain') {
      alert('Please upload a .vcf file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5 MB limit');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onFile(e.target.result as string, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <GlassCard style={{ animationDelay: '0.1s' }}>
      <div className="card-body">
        <div className="step-header">
          <div className="step-title">
            <div className="step-num" aria-hidden="true">1</div>
            Upload VCF File
          </div>
          <button className="load-sample-btn" onClick={onLoadSample} aria-label="Load sample VCF file">
            📄 Load Sample
          </button>
        </div>

        {!fileName ? (
          <div
            className={`dropzone${dragging ? ' drag-over' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Drop VCF file here or click to upload"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".vcf"
              aria-label="Choose VCF file"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              style={{ display: 'none' }}
            />
            <span className="dropzone-icon" aria-hidden="true">📂</span>
            <p><strong>Drop your VCF file here</strong> or click to browse</p>
            <small>Supports .vcf format (v4.2) · Max 5 MB</small>
          </div>
        ) : (
          <div className="file-success" role="status" aria-live="polite">
            <div className="file-success-icon" aria-hidden="true">✓</div>
            <div className="file-success-info">
              <div className="file-success-name">{fileName}</div>
              <div className="file-success-meta">VCF file loaded and validated</div>
            </div>
            <button
              className="file-remove-btn"
              onClick={onRemove}
              aria-label="Remove uploaded file"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default DragDropZone;

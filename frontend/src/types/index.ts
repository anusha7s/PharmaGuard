// ─── Core JSON Schema Types ────────────────────────────────────────────────

export type RiskLabel = 'Safe' | 'Adjust Dosage' | 'Toxic' | 'Ineffective' | 'Unknown';
export type Severity  = 'none' | 'low' | 'moderate' | 'high' | 'critical';
export type Phenotype = 'PM' | 'IM' | 'NM' | 'RM' | 'URM' | 'Unknown';
export type RiskColor = 'green' | 'orange' | 'red';
export type Urgency   = 'Routine' | 'Urgent' | 'Emergency';

export interface DetectedVariant {
  rsid: string;
  star: string;
  fn: string;
  chrom: string;
  pos: string;
  ref: string;
  alt: string;
  zygosity: 'Heterozygous' | 'Homozygous';
}

export interface RiskAssessment {
  risk_label:       RiskLabel;
  confidence_score: number;
  severity:         Severity;
  color:            RiskColor;
}

export interface PharmacogenomicProfile {
  primary_gene:      string;
  diplotype:         string;
  phenotype:         Phenotype | string;
  phenotype_label:   string;
  activity_score:    number;
  detected_variants: DetectedVariant[];
}

export interface ClinicalRecommendation {
  recommended_action: string;
  dosing_adjustment:  string;
  urgency:            Urgency;
  alternative_drugs:  string[];
  monitoring:         string;
  guideline_reference: string;
}

export interface LLMExplanation {
  summary:              string;
  biological_mechanism: string;
  variant_impact:       string;
  clinical_context:     string;
  evidence_level:       string;
}

export interface QualityMetrics {
  vcf_parsing_success: boolean;
  variants_detected:   number;
  genes_analyzed:      string;
  confidence_basis:    string;
  data_completeness:   number;
}

/** The exact output schema required by the hackathon spec */
export interface AnalysisResult {
  patient_id:              string;
  drug:                    string;
  timestamp:               string;
  risk_assessment:         RiskAssessment;
  pharmacogenomic_profile: PharmacogenomicProfile;
  clinical_recommendation: ClinicalRecommendation;
  llm_explanation:         LLMExplanation;
  quality_metrics:         QualityMetrics;
}

// ─── App State ─────────────────────────────────────────────────────────────

export interface AppState {
  vcfContent:    string | null;
  vcfFileName:   string | null;
  selectedDrugs: string[];
  results:       AnalysisResult[];
  activeTab:     number;
  isAnalyzing:   boolean;
  loadingStep:   string;
}

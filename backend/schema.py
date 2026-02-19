from pydantic import BaseModel
from typing import List


class Variant(BaseModel):
    rsid: str


class RiskAssessment(BaseModel):
    risk_label: str
    confidence_score: float
    severity: str


class PharmacogenomicProfile(BaseModel):
    primary_gene: str
    diplotype: str
    phenotype: str
    detected_variants: List[Variant]


class ClinicalRecommendation(BaseModel):
    recommendation: str
    cpic_reference: str


class LLMExplanation(BaseModel):
    summary: str
    biological_mechanism: str
    variant_impact: str
    clinical_context: str
    evidence_level: str


class DrugResult(BaseModel):
    drug: str
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMExplanation


class QualityMetrics(BaseModel):
    vcf_parsing_success: bool


class PharmaGuardResponse(BaseModel):
    patient_id: str
    timestamp: str
    results: List[DrugResult]
    quality_metrics: QualityMetrics

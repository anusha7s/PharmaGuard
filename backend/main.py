from fastapi import FastAPI, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from datetime import datetime
import asyncio

# Rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

from vcf_parser import parse_vcf
from rule_engine import (
    calculate_confidence,
    determine_star,
    determine_phenotype,
    assess_risk,
    determine_zygosity,
    calculate_activity_score,
    get_alternative_drugs,
)
from llm_service import generate_mechanism
from mappings import DRUG_RULES

app = FastAPI()

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Rate Limiter
# =========================
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# =========================
# Concurrency Control
# =========================
MAX_CONCURRENT_ANALYSES = 2
analysis_semaphore = asyncio.Semaphore(MAX_CONCURRENT_ANALYSES)

# =========================
# File Size Limit (2MB)
# =========================
MAX_FILE_SIZE = 2 * 1024 * 1024

# =========================
# Simple In-Memory Cache
# =========================
mechanism_cache = {}

# =========================
# Helper Functions
# =========================
def severity_to_color(severity: str):
    if severity in ["none", "low"]:
        return "green"
    if severity == "moderate":
        return "orange"
    return "red"


def severity_to_urgency(severity: str):
    if severity in ["none", "low"]:
        return "Routine"
    if severity == "moderate":
        return "Urgent"
    if severity in ["high", "critical"]:
        return "Emergency"
    return "Routine"


# =========================
# MAIN ENDPOINT
# =========================
@app.post("/analyze")
@limiter.limit("5/minute")
async def analyze_vcf(
    request: Request,
    file: UploadFile,
    drugs: str = Form(...)
):

    async with analysis_semaphore:

        if not file.filename.endswith(".vcf"):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload a valid .vcf genomic file."
            )

        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="VCF file too large. Maximum allowed size is 2MB."
            )

        content = content.decode("utf-8")

        # Run parsing in threadpool (CPU safe)
        parsed_variants = await run_in_threadpool(parse_vcf, content)

        if not parsed_variants:
            raise HTTPException(
                status_code=400,
                detail="VCF file parsed but no pharmacogenomic variants detected."
            )

        drug_list = [d.strip().upper() for d in drugs.split(",")]
        results = []

        for drug_name in drug_list:

            rule = DRUG_RULES.get(drug_name)
            if not rule:
                continue

            gene = rule["gene"]
            gene_variants = [v for v in parsed_variants if v["gene"] == gene]

            # Run heavy logic in threadpool
            diplotype = await run_in_threadpool(determine_star, gene, gene_variants)
            activity_score = await run_in_threadpool(calculate_activity_score, gene, diplotype)
            phenotype = await run_in_threadpool(determine_phenotype, gene, diplotype)
            alternatives = await run_in_threadpool(get_alternative_drugs, drug_name, phenotype)

            detected_variants = []

            for variant in gene_variants:
                detected_variants.append({
                    "rsid": variant["rsid"],
                    "star": variant.get("star", "*1"),
                    "fn": variant.get("impact", "Unknown"),
                    "chrom": variant["chrom"],
                    "pos": variant["pos"],
                    "ref": variant["ref"],
                    "alt": variant["alt"],
                    "zygosity": determine_zygosity(variant["genotype"])
                })

            risk_data = await run_in_threadpool(assess_risk, drug_name, phenotype)

            confidence = await run_in_threadpool(
                calculate_confidence,
                gene,
                diplotype,
                phenotype,
                drug_name,
                detected_variants
            )

            summary = (
                f"The patient has {gene} {diplotype}, consistent with "
                f"{phenotype} phenotype. According to CPIC guidelines, "
                f"{drug_name} is classified as '{risk_data['risk']}'."
            )

            # =========================
            # LLM with Cache + Timeout
            # =========================
            cache_key = f"{gene}-{diplotype}-{drug_name}"

            if cache_key in mechanism_cache:
                mechanism = mechanism_cache[cache_key]
            else:
                try:
                    mechanism = await asyncio.wait_for(
                        run_in_threadpool(
                            generate_mechanism,
                            gene,
                            diplotype,
                            phenotype,
                            drug_name,
                            risk_data["risk"],
                            [v["rsid"] for v in gene_variants]
                        ),
                        timeout=15
                    )
                except asyncio.TimeoutError:
                    mechanism = "Mechanism explanation unavailable (timeout)."

                mechanism_cache[cache_key] = mechanism

            results.append({
                "patient_id": "PATIENT_001",
                "drug": drug_name,
                "timestamp": datetime.utcnow().isoformat(),
                "risk_assessment": {
                    "risk_label": risk_data["risk"],
                    "confidence_score": confidence,
                    "severity": risk_data["severity"],
                    "color": severity_to_color(risk_data["severity"])
                },
                "pharmacogenomic_profile": {
                    "primary_gene": gene,
                    "diplotype": diplotype,
                    "phenotype": phenotype,
                    "phenotype_label": phenotype,
                    "activity_score": activity_score,
                    "detected_variants": detected_variants
                },
                "clinical_recommendation": {
                    "recommended_action": risk_data["recommendation"],
                    "dosing_adjustment": risk_data["recommendation"],
                    "urgency": severity_to_urgency(risk_data["severity"]),
                    "alternative_drugs": alternatives,
                    "monitoring": "Standard monitoring per CPIC guideline.",
                    "guideline_reference": f"CPIC {gene}-{drug_name}"
                },
                "llm_explanation": {
                    "summary": summary,
                    "biological_mechanism": mechanism,
                    "variant_impact": "Variant impacts enzyme activity affecting drug metabolism.",
                    "clinical_context": "Recommendation derived from CPIC pharmacogenomic guidelines.",
                    "evidence_level": "CPIC Level A"
                },
                "quality_metrics": {
                    "vcf_parsing_success": True,
                    "variants_detected": len(gene_variants),
                    "genes_analyzed": gene,
                    "confidence_basis": "Variant + Phenotype + CPIC rule mapping",
                    "data_completeness": 1.0
                }
            })

        return {"results": results}
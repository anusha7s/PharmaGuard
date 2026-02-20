from mappings import VARIANT_TO_STAR, DIPLOTYPE_TO_PHENOTYPE, DRUG_RULES


# ─────────────────────────────────────────────
# Determine Zygosity from genotype
# ─────────────────────────────────────────────
def determine_zygosity(genotype: str):

    if not genotype:
        return "Unknown"

    # Remove extra FORMAT info if present (e.g. GT:DP:GQ)
    genotype = genotype.split(":")[0]

    # Normalize separators
    genotype = genotype.replace("|", "/")

    alleles = genotype.split("/")

    # Missing genotype
    if "." in alleles:
        return "Unknown"

    # Homozygous reference
    if alleles[0] == alleles[1] == "0":
        return "Homozygous Reference"

    # Homozygous alternate (any non-zero identical)
    if alleles[0] == alleles[1] and alleles[0] != "0":
        return "Homozygous"

    # Heterozygous (one ref + one alt OR two different alts)
    if alleles[0] != alleles[1]:
        return "Heterozygous"

    return "Unknown"

# ─────────────────────────────────────────────
# Determine Star Alleles (Diplotype)
# ─────────────────────────────────────────────
# ───────────────────────────────────────────────
# Variant to Star Allele Mapping
# ───────────────────────────────────────────────

VARIANT_STAR_MAP = {

    "CYP2C19": {
        "rs4244285": "*2",
        "rs4986893": "*3",
        "rs12248560": "*17"
    },

    "CYP2C9": {
        "rs1799853": "*2",
        "rs1057910": "*3"
    },

    "CYP2D6": {
        "rs3892097": "*4",
        "rs1065852": "*10"
    }

}
def determine_star(gene: str, variants: list):

    if gene not in VARIANT_STAR_MAP:
        return "*1/*1"

    star_map = VARIANT_STAR_MAP[gene]

    detected_stars = []

    for v in variants:
        rsid = v.get("rsid")
        zygosity = determine_zygosity(v.get("genotype"))

        if rsid in star_map:

            star = star_map[rsid]

            if zygosity == "Homozygous":
                return f"{star}/{star}"

            if zygosity == "Heterozygous":
                detected_stars.append(star)

    if len(detected_stars) == 1:
        return f"*1/{detected_stars[0]}"

    if len(detected_stars) >= 2:
        return f"{detected_stars[0]}/{detected_stars[1]}"

    return "*1/*1"


# ─────────────────────────────────────────────
# Determine Phenotype
# ─────────────────────────────────────────────
ALLOWED_PHENOTYPES = ["PM", "IM", "NM", "RM", "URM", "Unknown"]

def determine_phenotype(gene: str, diplotype: str):

    if not gene or not diplotype:
        return "Unknown"

    gene = gene.upper()

    # Normalize diplotype safely
    try:
        allele1, allele2 = diplotype.split("/")
        alleles = sorted([allele1.strip(), allele2.strip()])
    except Exception:
        return "Unknown"

    # ───────────────── CYP2D6 ─────────────────
    if gene == "CYP2D6":

        if alleles == ["*4", "*4"]:
            return "PM"

        if "*4" in alleles:
            return "IM"

        return "NM"

    # ───────────────── CYP2C19 ─────────────────
    if gene == "CYP2C19":

        if alleles in [["*2", "*2"], ["*3", "*3"]]:
            return "PM"

        if "*2" in alleles or "*3" in alleles:
            return "IM"

        return "NM"

    # ───────────────── CYP2C9 ─────────────────
    if gene == "CYP2C9":

        if alleles == ["*3", "*3"]:
            return "PM"

        if "*2" in alleles or "*3" in alleles:
            return "IM"

        return "NM"

    # ───────────────── SLCO1B1 ─────────────────
    if gene == "SLCO1B1":

        if alleles == ["*5", "*5"]:
            return "PM"

        if "*5" in alleles:
            return "IM"

        return "NM"

    # ───────────────── TPMT ─────────────────
    if gene == "TPMT":

        if alleles == ["*2", "*2"] or any(a.startswith("*3") for a in alleles):
            return "PM"

        if "*2" in alleles:
            return "IM"

        return "NM"

    # ───────────────── DPYD ─────────────────
    if gene == "DPYD":

        if alleles == ["*2A", "*2A"]:
            return "PM"

        if "*2A" in alleles:
            return "IM"

        return "NM"

    return "Unknown"

# ─────────────────────────────────────────────
# Activity Score Calculation
# ─────────────────────────────────────────────

# ───────────────────────────────────────────────
# CPIC Allele Activity Score Tables
# ───────────────────────────────────────────────

ALLELE_SCORES = {

    "CYP2C19": {
        "*1": 1.0,
        "*2": 0.0,
        "*3": 0.0,
        "*17": 1.5
    },

    "CYP2C9": {
        "*1": 1.0,
        "*2": 0.5,
        "*3": 0.0
    },

    "CYP2D6": {
        "*1": 1.0,
        "*2": 1.0,
        "*4": 0.0,
        "*5": 0.0,
        "*10": 0.25
    }

}

def calculate_activity_score(gene: str, diplotype: str) -> float:

    if gene not in ALLELE_SCORES:
        return 1.0  # default safe fallback

    allele_table = ALLELE_SCORES[gene]

    try:
        allele1, allele2 = diplotype.split("/")
    except ValueError:
        return 1.0

    score1 = allele_table.get(allele1, 1.0)
    score2 = allele_table.get(allele2, 1.0)

    return round(score1 + score2, 2)

# ─────────────────────────────────────────────
# Risk Assessment
# ─────────────────────────────────────────────
ALLOWED_SEVERITIES = ["none", "low", "moderate", "high", "critical"]

def assess_risk(drug: str, phenotype: str):
    rule = DRUG_RULES.get(drug)

    if not rule:
        return {
            "risk": "Unknown",
            "severity": "low",
            "recommendation": "No clinical guideline available for this drug."
        }

    phenotype_data = rule["phenotypes"].get(phenotype)

    if not phenotype_data:
        return {
            "risk": "Unknown",
            "severity": "low",
            "recommendation": "No phenotype rule available. Consult clinician."
        }

    severity = phenotype_data["severity"]

    # Enforce allowed values
    if severity not in ALLOWED_SEVERITIES:
        severity = "low"

    return {
        "risk": phenotype_data["risk"],
        "severity": severity,
        "recommendation": rule.get("recommendations", {}).get(
            phenotype,
            "Follow clinical guidelines."
        )
    }

# ─────────────────────────────────────────────
# Confidence Scoring
# ─────────────────────────────────────────────
def calculate_confidence(
    gene: str,
    diplotype: str,
    phenotype: str,
    drug: str,
    variants: list
) -> float:

    # 1️⃣ Variant Strength
    if variants:
        variant_strength = 1.0
    else:
        variant_strength = 0.6  # assumed wildtype

    # 2️⃣ Zygosity Certainty
    zygosity_score = 1.0
    for v in variants:
        if v.get("zygosity") not in ["Heterozygous", "Homozygous"]:
            zygosity_score = 0.7

    # 3️⃣ Diplotype Certainty
    if "*1/*1" == diplotype:
        diplotype_certainty = 0.7
    else:
        diplotype_certainty = 1.0

    # 4️⃣ Rule Match Score
    from mappings import DRUG_RULES

    if drug in DRUG_RULES:
        rule_match_score = 1.0
    else:
        rule_match_score = 0.5

    # 5️⃣ Copy Number Certainty (CYP2D6 only)
    copy_number_certainty = 1.0
    if gene == "CYP2D6":
        has_cn = any(v.get("copy_number") for v in variants)
        if not has_cn:
            copy_number_certainty = 0.8

    # Weighted Score
    confidence = (
        0.30 * variant_strength +
        0.20 * zygosity_score +
        0.20 * diplotype_certainty +
        0.20 * rule_match_score +
        0.10 * copy_number_certainty
    )

    # Boundaries
    confidence = max(0.5, min(0.99, confidence))

    return round(confidence, 2)

ALTERNATIVE_DRUGS = {

    "CLOPIDOGREL": {
        "PM": ["PRASUGREL", "TICAGRELOR"],
        "IM": ["PRASUGREL", "TICAGRELOR"]
    },

    "CODEINE": {
        "PM": ["MORPHINE", "HYDROMORPHONE"],
        "UM": ["MORPHINE", "HYDROMORPHONE"]
    },

    "WARFARIN": {
        "PM": ["APIXABAN", "RIVAROXABAN"],
        "IM": []
    }

}
def get_alternative_drugs(drug: str, phenotype: str):

    if drug not in ALTERNATIVE_DRUGS:
        return []

    return ALTERNATIVE_DRUGS[drug].get(phenotype, [])

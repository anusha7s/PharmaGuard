from mappings import VARIANT_TO_STAR, DIPLOTYPE_TO_PHENOTYPE, DRUG_RULES


# ─────────────────────────────────────────────
# Determine Zygosity from genotype
# ─────────────────────────────────────────────
def determine_zygosity(genotype: str):

    if genotype in ["1/1", "1|1"]:
        return "Homozygous"
    if genotype in ["0/1", "1/0", "0|1", "1|0"]:
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
def determine_phenotype(gene: str, diplotype: str):

    gene = gene.upper()

    # ───────────────── CYP2D6 ─────────────────
    if gene == "CYP2D6":
        if "*4/*4" in diplotype:
            return "PM"
        if "*4" in diplotype:
            return "IM"
        return "NM"

    # ───────────────── CYP2C19 ─────────────────
    if gene == "CYP2C19":
        if "*2/*2" in diplotype or "*3/*3" in diplotype:
            return "PM"
        if "*2" in diplotype or "*3" in diplotype:
            return "IM"
        return "NM"

    # ───────────────── CYP2C9 ─────────────────
    if gene == "CYP2C9":
        if "*3/*3" in diplotype:
            return "PM"
        if "*2" in diplotype or "*3" in diplotype:
            return "IM"
        return "NM"

    # ───────────────── SLCO1B1 ─────────────────
    if gene == "SLCO1B1":
        if "*5/*5" in diplotype:
            return "PM"
        if "*5" in diplotype:
            return "IM"
        return "NM"

    # ───────────────── TPMT ─────────────────
    if gene == "TPMT":
        if "*2/*2" in diplotype or "*3" in diplotype:
            return "PM"
        if "*2" in diplotype:
            return "IM"
        return "NM"

    # ───────────────── DPYD ─────────────────
    if gene == "DPYD":
        if "*2A/*2A" in diplotype:
            return "PM"
        if "*2A" in diplotype:
            return "IM"
        return "NM"

    return "NM"




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
def assess_risk(drug: str, phenotype: str):
    rule = DRUG_RULES.get(drug)

    if not rule:
        return {
            "risk": "Unknown",
            "severity": "low",
            "recommendation": "No guideline available."
        }

    phenotype_data = rule["phenotypes"].get(phenotype)

    if not phenotype_data:
        return {
            "risk": "Unknown",
            "severity": "low",
            "recommendation": "No phenotype rule found."
        }

    return {
        "risk": phenotype_data["risk"],
        "severity": phenotype_data["severity"],
        "recommendation": rule["recommendation"].get(
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

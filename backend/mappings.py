VARIANT_TO_STAR = {
    "CYP2D6": {
        "rs3892097": "*4",     # Loss of function
        "rs1065852": "*10"     # Reduced function
    },
    "CYP2C19": {
        "rs4244285": "*2",     # Loss of function
        "rs4986893": "*3"      # Loss of function
    },
    "CYP2C9": {
        "rs1799853": "*2",
        "rs1057910": "*3"
    },
    "SLCO1B1": {
        "rs4149056": "*5"
    },
    "TPMT": {
        "rs1800462": "*2",
        "rs1142345": "*3A"
    },
    "DPYD": {
        "rs3918290": "*2A"
    }
}
DIPLOTYPE_TO_PHENOTYPE = {
    "CYP2D6": {
        "*4/*4": "PM",
        "*1/*4": "IM",
        "*1/*10": "IM",
        "*1/*1": "NM"
    },
    "CYP2C19": {
        "*2/*2": "PM",
        "*2/*3": "PM",
        "*1/*2": "IM",
        "*1/*1": "NM"
    },
    "CYP2C9": {
        "*3/*3": "PM",
        "*1/*3": "IM",
        "*1/*1": "NM"
    },
    "SLCO1B1": {
        "*5/*5": "Low",
        "*1/*5": "Intermediate",
        "*1/*1": "Normal"
    },
    "TPMT": {
        "*3A/*3A": "Low",
        "*1/*3A": "Intermediate",
        "*1/*1": "Normal"
    },
    "DPYD": {
        "*2A/*2A": "Deficient",
        "*1/*2A": "Intermediate",
        "*1/*1": "Normal"
    }
}
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
DRUG_RULES = {

    # ---------------- CYP2D6 ----------------

    "CODEINE": {
        "gene": "CYP2D6",
        "phenotypes": {
            "PM": {"risk": "Toxic", "severity": "critical"},
            "IM": {"risk": "Adjust Dosage", "severity": "moderate"},
            "NM": {"risk": "Safe", "severity": "none"}
        },
        "recommendation": {
            "PM": "Avoid codeine. Use morphine or hydromorphone instead.",
            "IM": "Consider lower dose or alternative opioid.",
            "NM": "Standard dosing appropriate."
        }
    },

    # ---------------- CYP2C19 ----------------

    "CLOPIDOGREL": {
        "gene": "CYP2C19",
        "phenotypes": {
            "PM": {"risk": "Ineffective", "severity": "high"},
            "IM": {"risk": "Adjust Dosage", "severity": "moderate"},
            "NM": {"risk": "Safe", "severity": "none"}
        },
        "recommendation": {
            "PM": "Use alternative antiplatelet such as prasugrel or ticagrelor.",
            "IM": "Consider alternative therapy or adjusted dosing.",
            "NM": "Standard dosing appropriate."
        }
    },

    # ---------------- CYP2C9 ----------------

    "WARFARIN": {
        "gene": "CYP2C9",
        "phenotypes": {
            "PM": {"risk": "Toxic", "severity": "high"},
            "IM": {"risk": "Adjust Dosage", "severity": "moderate"},
            "NM": {"risk": "Safe", "severity": "none"}
        },
        "recommendation": {
            "PM": "Reduce starting dose significantly and monitor INR closely.",
            "IM": "Consider lower starting dose with INR monitoring.",
            "NM": "Standard dosing."
        }
    },

    # ---------------- SLCO1B1 ----------------

    "SIMVASTATIN": {
        "gene": "SLCO1B1",
        "phenotypes": {
            "PM": {"risk": "Toxic", "severity": "high"},
            "IM": {"risk": "Adjust Dosage", "severity": "moderate"},
            "NM": {"risk": "Safe", "severity": "none"}
        },
        "recommendation": {
            "PM": "Avoid simvastatin. Use pravastatin or rosuvastatin.",
            "IM": "Consider lower dose and monitor for myopathy.",
            "NM": "Standard dosing."
        }
    },

    # ---------------- TPMT ----------------

    "AZATHIOPRINE": {
        "gene": "TPMT",
        "phenotypes": {
            "PM": {"risk": "Toxic", "severity": "critical"},
            "IM": {"risk": "Adjust Dosage", "severity": "moderate"},
            "NM": {"risk": "Safe", "severity": "none"}
        },
        "recommendation": {
            "PM": "Avoid or drastically reduce dose due to high myelosuppression risk.",
            "IM": "Reduce starting dose and monitor blood counts.",
            "NM": "Standard dosing."
        }
    },

    # ---------------- DPYD ----------------

    "FLUOROURACIL": {
        "gene": "DPYD",
        "phenotypes": {
            "PM": {"risk": "Toxic", "severity": "critical"},
            "IM": {"risk": "Adjust Dosage", "severity": "high"},
            "NM": {"risk": "Safe", "severity": "none"}
        },
        "recommendation": {
            "PM": "Avoid fluorouracil due to life-threatening toxicity risk.",
            "IM": "Reduce starting dose by 50% and monitor closely.",
            "NM": "Standard dosing."
        }
    }
}


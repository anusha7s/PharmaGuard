import os
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

# Load .env correctly (important for Windows + uvicorn)
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables.")

# ✅ Initialize Groq client
client = Groq(api_key=api_key)


def generate_mechanism(gene, diplotype, phenotype, drug, risk, variants):

    prompt = f"""
    You are a pharmacogenomics specialist.

    Gene: {gene}
    Diplotype: {diplotype}
    Drug: {drug}
    Detected Variants: {', '.join(variants)}

    Explain the enzymatic role of this gene in drug metabolism.

    Important:
    - Do NOT discuss drug concentrations.
    - Do NOT discuss increased or decreased levels.
    - Do NOT provide dosing advice.
    - Do NOT restate phenotype.
    - Only describe how the variant affects enzymatic activity and metabolic conversion.

    Explain strictly:
    - The enzyme's functional role
    - The specific reaction type (O-demethylation if applicable)
    - Avoid naming metabolites unless directly correct
    - Do not introduce unrelated metabolites
    - Keep explanation mechanistic and general


    Return plain professional medical explanation.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a precise clinical AI assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1
    )

    return response.choices[0].message.content.strip()




# import os
# from groq import Groq
# from dotenv import load_dotenv

# load_dotenv()
# api_key = os.getenv("GROQ_API_KEY")
# if not api_key:
#     raise ValueError("GROQ_API_KEY not found in environment variables.")

# client = Groq(api_key=api_key)

# def generate_explanation(gene, diplotype, phenotype, drug, risk, variants):

#     prompt = f"""
#     You are a clinical pharmacogenomics assistant.

#     Structured Patient Data:
#     Gene: {gene}
#     Diplotype: {diplotype}
#     Phenotype: {phenotype}
#     Drug: {drug}
#     Risk Classification: {risk}
#     Detected Variants: {', '.join(variants)}

#     Instructions:
# - You MUST use the provided phenotype exactly as given.
# - Do NOT reinterpret genotype.
# - Do NOT infer a different metabolizer status.
# - The phenotype is already determined by a clinical rule engine.
# - Do NOT contradict the risk classification.
# - Return plain text only.


#     Return exactly:
#     First line: A short clinical summary (1-2 sentences).
#     Then: A biological mechanism explanation paragraph.
#     """
#     response = client.chat.completions.create(
#         model="llama-3.1-8b-instant",
#         messages=[
#             {"role": "system", "content": "You are a precise clinical AI assistant."},
#             {"role": "user", "content": prompt}
#         ],
#         temperature=0.1
#     )

#     output_text = response.choices[0].message.content.strip()

#     lines = output_text.split("\n")

#     summary = lines[0]
#     mechanism = "\n".join(lines[1:]).strip()


#     return {
#         "summary": summary,
#         "mechanism": mechanism
#     }
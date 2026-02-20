import type { AnalysisResult } from '../types';

export const SAMPLE_VCF = `##fileformat=VCFv4.2
##FILTER=<ID=PASS,Description="All filters passed">
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene Symbol">
##INFO=<ID=STAR,Number=1,Type=String,Description="Star Allele">
##INFO=<ID=RS,Number=1,Type=String,Description="dbSNP rsID">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tPATIENT_047
chr22\t42523943\trs3892097\tC\tT\t99\tPASS\tGENE=CYP2D6;STAR=*4;RS=rs3892097\tGT\t0/1
chr10\t96521657\trs4244285\tG\tA\t99\tPASS\tGENE=CYP2C19;STAR=*2;RS=rs4244285\tGT\t0/0
chr10\t96741053\trs1799853\tC\tT\t99\tPASS\tGENE=CYP2C9;STAR=*2;RS=rs1799853\tGT\t0/0
chr12\t21284072\trs4149056\tT\tC\t99\tPASS\tGENE=SLCO1B1;STAR=*5;RS=rs4149056\tGT\t0/0
chr6\t18128556\trs1800462\tG\tC\t99\tPASS\tGENE=TPMT;STAR=*2;RS=rs1800462\tGT\t0/0
chr1\t98348885\trs3918290\tC\tT\t99\tPASS\tGENE=DPYD;STAR=*2A;RS=rs3918290\tGT\t0/0`;

const API_URL =
  import.meta.env.VITE_API_URL || 'https://pharmaguard-9agy.onrender.com';

let currentController: AbortController | null = null;
let isAnalyzing = false;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok && retries > 0) {
      await delay(1000);
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(1000);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function analyzeVCF(
  vcfContent: string,
  vcfFileName: string,
  drugs: string[]
): Promise<AnalysisResult[]> {

  if (isAnalyzing) {
    throw new Error("Analysis already in progress. Please wait.");
  }

  isAnalyzing = true;

  // Cancel previous request if exists
  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();

  const formData = new FormData();
  const file = new File([vcfContent], vcfFileName, { type: 'text/plain' });

  formData.append('file', file);
  formData.append('drugs', drugs.join(','));

  try {
    const response = await fetchWithRetry(
      `${API_URL}/analyze`,
      {
        method: 'POST',
        body: formData,
        signal: currentController.signal
      },
      2
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: 'Network error' }));

      throw new Error(
        errorData.detail ||
        'Genomic analysis failed. Please verify the uploaded VCF file.'
      );
    }

    const data = await response.json();
    return data.results;

  } catch (error: any) {

    if (error.name === "AbortError") {
      console.log("Previous request cancelled.");
      return [];
    }

    console.error('Error analyzing VCF:', error);
    throw error;

  } finally {
    isAnalyzing = false;
  }
}
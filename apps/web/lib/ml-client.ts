/**
 * Server-side client for the InspectAI ML service.
 * Only call this from API routes — never from client components.
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "";
const ML_SERVICE_API_KEY = process.env.ML_SERVICE_API_KEY || "";

interface MlClientOptions {
  signal?: AbortSignal;
}

async function mlFetch<T>(
  path: string,
  init: RequestInit = {},
  options: MlClientOptions = {}
): Promise<T> {
  if (!ML_SERVICE_URL) {
    throw new Error("ML_SERVICE_URL is not configured");
  }

  const response = await fetch(`${ML_SERVICE_URL}${path}`, {
    ...init,
    signal: options.signal,
    headers: {
      "Content-Type": "application/json",
      ...(ML_SERVICE_API_KEY ? { "X-API-Key": ML_SERVICE_API_KEY } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new Error(`ML service error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export interface CostEstimateResponse {
  estimate: number;
  min_cost: number;
  max_cost: number;
  category: string;
  severity: string;
  confidence: number;
}

export interface SimilarFindingResult {
  id: string;
  inspection_id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  cost_estimate: number | null;
  similarity: number;
}

export interface SimilarFindingsResponse {
  findings: SimilarFindingResult[];
  query_embedding: number[] | null;
}

export interface EmbeddingResponse {
  embedding: number[];
  dimensions: number;
  model: string;
}

/**
 * Estimate repair cost for a finding by category and severity.
 */
export async function estimateCost(
  category: string,
  severity: string,
  description?: string,
  options?: MlClientOptions
): Promise<CostEstimateResponse> {
  return mlFetch<CostEstimateResponse>(
    "/costs/estimate",
    {
      method: "POST",
      body: JSON.stringify({
        category: category.toLowerCase(),
        severity: severity.toLowerCase(),
        description: description ?? null,
      }),
    },
    options
  );
}

/**
 * Find similar findings by text query using pgvector similarity search.
 */
export async function findSimilarFindings(
  text: string,
  limit = 5,
  threshold = 0.7,
  options?: MlClientOptions
): Promise<SimilarFindingsResponse> {
  return mlFetch<SimilarFindingsResponse>(
    "/embeddings/similar",
    {
      method: "POST",
      body: JSON.stringify({ text, limit, threshold }),
    },
    options
  );
}

/**
 * Generate and optionally store an embedding for a finding.
 * Pass findingId to persist the embedding in the database.
 */
export async function generateEmbedding(
  text: string,
  findingId?: string,
  options?: MlClientOptions
): Promise<EmbeddingResponse> {
  return mlFetch<EmbeddingResponse>(
    "/embeddings",
    {
      method: "POST",
      body: JSON.stringify({ text, finding_id: findingId ?? null }),
    },
    options
  );
}

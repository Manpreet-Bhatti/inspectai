#!/usr/bin/env bash
# Deploy InspectAI ML service to Google Cloud Run (scale-to-zero, CPU-only).
#
# Prerequisites:
#   gcloud auth login
#   gcloud auth configure-docker <REGION>-docker.pkg.dev
#
# Usage:
#   ./deploy.sh                         # deploy with defaults
#   PROJECT=my-project REGION=us-east1 ./deploy.sh

set -euo pipefail

PROJECT="${PROJECT:-$(gcloud config get-value project)}"
REGION="${REGION:-us-central1}"
SERVICE="inspectai-ml"
REPO="inspectai"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${SERVICE}"

# ── 1. Artifact Registry ──────────────────────────────────────────────────────
echo "→ Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories describe "${REPO}" \
    --location="${REGION}" \
    --project="${PROJECT}" &>/dev/null \
  || gcloud artifacts repositories create "${REPO}" \
       --repository-format=docker \
       --location="${REGION}" \
       --project="${PROJECT}"

# ── 2. Build & push ───────────────────────────────────────────────────────────
echo "→ Building and pushing image..."
gcloud builds submit \
  --tag "${IMAGE}:latest" \
  --project="${PROJECT}" \
  .

# ── 3. Deploy ─────────────────────────────────────────────────────────────────
echo "→ Deploying to Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}:latest" \
  --platform managed \
  --region "${REGION}" \
  --project "${PROJECT}" \
  --no-allow-unauthenticated \
  --min-instances 0 \
  --max-instances 4 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --concurrency 10 \
  --set-secrets "SUPABASE_URL=inspectai-supabase-url:latest" \
  --set-secrets "SUPABASE_SERVICE_ROLE_KEY=inspectai-supabase-service-role-key:latest" \
  --set-secrets "HUGGINGFACE_TOKEN=inspectai-huggingface-token:latest" \
  --set-secrets "API_KEY=inspectai-ml-api-key:latest" \
  --set-env-vars "UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL:-}" \
  --set-env-vars "UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN:-}" \
  --set-env-vars 'CORS_ORIGINS=["https://inspectai.vercel.app"]' \
  --set-env-vars "LOG_LEVEL=INFO"

URL=$(gcloud run services describe "${SERVICE}" \
  --region "${REGION}" \
  --project "${PROJECT}" \
  --format "value(status.url)")

echo ""
echo "✓ Deployed: ${URL}"
echo "  Health:   ${URL}/health"
echo ""
echo "Add this to your Next.js environment:"
echo "  ML_SERVICE_URL=${URL}"

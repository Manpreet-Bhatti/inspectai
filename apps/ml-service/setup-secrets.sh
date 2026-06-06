#!/usr/bin/env bash
# Create Secret Manager secrets for the ML service.
# Run this once before the first deploy.
#
# Usage:
#   PROJECT=my-project ./setup-secrets.sh

set -euo pipefail

PROJECT="${PROJECT:-$(gcloud config get-value project)}"

create_secret() {
  local name="$1"
  local prompt="$2"
  echo -n "${prompt}: "
  read -rs value
  echo

  if gcloud secrets describe "${name}" --project="${PROJECT}" &>/dev/null; then
    echo "  → Updating existing secret: ${name}"
    echo -n "${value}" | gcloud secrets versions add "${name}" \
      --data-file=- \
      --project="${PROJECT}"
  else
    echo "  → Creating secret: ${name}"
    echo -n "${value}" | gcloud secrets create "${name}" \
      --data-file=- \
      --replication-policy=automatic \
      --project="${PROJECT}"
  fi
}

echo "Enable Secret Manager API..."
gcloud services enable secretmanager.googleapis.com --project="${PROJECT}"

echo ""
echo "Enter secret values (input is hidden):"
create_secret "inspectai-supabase-url"              "SUPABASE_URL"
create_secret "inspectai-supabase-service-role-key" "SUPABASE_SERVICE_ROLE_KEY"
create_secret "inspectai-huggingface-token"         "HUGGINGFACE_TOKEN"
create_secret "inspectai-ml-api-key"               "API_KEY (generate with: openssl rand -hex 32)"

echo ""
echo "✓ Secrets created. Grant Cloud Run access:"
echo ""
echo "  PROJECT_NUMBER=\$(gcloud projects describe ${PROJECT} --format='value(projectNumber)')"
echo "  gcloud projects add-iam-policy-binding ${PROJECT} \\"
echo "    --member=\"serviceAccount:\${PROJECT_NUMBER}-compute@developer.gserviceaccount.com\" \\"
echo "    --role=\"roles/secretmanager.secretAccessor\""

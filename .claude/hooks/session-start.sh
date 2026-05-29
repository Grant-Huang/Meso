#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Use pnpm (not yarn) — this repo uses pnpm workspaces
pnpm install --frozen-lockfile

# Build workspace packages so imports resolve
pnpm --filter @meso.ai/types run build
pnpm --filter @meso.ai/ui    run build

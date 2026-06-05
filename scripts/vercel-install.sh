#!/bin/sh
set -e
mkdir -p "$HOME/bin"
curl -fsSL https://github.com/pnpm/pnpm/releases/download/v10.33.0/pnpm-linux-x64 -o "$HOME/bin/pnpm"
chmod +x "$HOME/bin/pnpm"
export PATH="$HOME/bin:$PATH"
pnpm --version
COREPACK_ENABLE_STRICT=0 pnpm install --frozen-lockfile

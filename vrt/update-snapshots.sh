#!/bin/bash
set -euo pipefail

# VRT スナップショット (chromium/firefox/webkit-linux) を Docker 内で再生成する。
# 描画ロジックや@playwright/testの更新でVRTがこける際に使う。
#
# 使い方:
#   ./vrt/update-snapshots.sh
#
# 前提:
#   - Docker が起動していること (colima などでも可)
#   - vrt/package.json の @playwright/test バージョンに対応するイメージを pull できること

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PLAYWRIGHT_VERSION="$(node -p "require('$SCRIPT_DIR/package.json').devDependencies['@playwright/test']")"
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy"

echo "Using image: $IMAGE" >&2

docker run --rm \
  -v "$REPO_ROOT:/work" \
  -w /work \
  "$IMAGE" \
  bash -euo pipefail -c '
    apt-get update -qq && apt-get install -yqq unzip >/dev/null
    curl -fsSL https://deno.land/install.sh | sh -s -- -y
    export PATH="/root/.deno/bin:$PATH"

    cd /work/vrt
    yarn install --frozen-lockfile

    node json-server.js &
    JSON_PID=$!

    cd /work
    CI=true deno run --unstable-kv --allow-net --allow-env --allow-read server.ts &
    DENO_PID=$!

    # Wait for both services
    for _ in {1..30}; do
      if curl -fsS http://localhost:8000 >/dev/null 2>&1 && \
         curl -fsS -o /dev/null -w "%{http_code}" http://localhost:8080/swfz | grep -qE "^(200|404)"; then
        echo "servers ready"
        break
      fi
      sleep 1
    done

    cd /work/vrt
    yarn playwright test --update-snapshots
    RESULT=$?

    kill "$JSON_PID" "$DENO_PID" 2>/dev/null || true
    exit "$RESULT"
  '

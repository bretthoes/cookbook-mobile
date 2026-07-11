#!/usr/bin/env bash
# Preflight checks before eas build --platform android --profile production
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=env.sh
source "$SCRIPT_DIR/env.sh"

ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
cd "$ROOT"

errors=0
warn=0

fail() { echo "ERROR: $1" >&2; errors=$((errors + 1)); }
warn_msg() { echo "WARN:  $1" >&2; warn=$((warn + 1)); }
ok() { echo "OK:    $1"; }

echo "Android upload preflight (cookbook-mobile)"
echo "Repo: $ROOT"
echo

# Prod API URL
if grep -q 'CHANGEME' config/config.prod.ts 2>/dev/null; then
  fail "config/config.prod.ts still contains CHANGEME"
else
  ok "config/config.prod.ts has no CHANGEME placeholders"
fi

if ! grep -q 'API_URL:' config/config.prod.ts 2>/dev/null; then
  fail "config/config.prod.ts missing API_URL"
fi

# Package name in app.json
if ! grep -q '"package": "com.cookbookmobile"' app.json 2>/dev/null; then
  fail 'app.json android.package is not "com.cookbookmobile"'
else
  ok "android.package is com.cookbookmobile"
fi

# EAS CLI
if ! command -v eas >/dev/null 2>&1; then
  fail "eas CLI not found (install: npm install -g eas-cli)"
else
  ok "eas CLI installed ($(eas --version 2>/dev/null | head -1))"
fi

# EAS login
if command -v eas >/dev/null 2>&1; then
  if eas whoami >/dev/null 2>&1; then
    ok "logged in to EAS as $(eas whoami 2>/dev/null | head -1)"
  else
    fail "not logged in to EAS (run: eas login)"
  fi
fi

# eas.json production profile
if ! grep -q '"production"' eas.json 2>/dev/null; then
  fail "eas.json missing production build profile"
else
  ok "eas.json has production profile"
fi

# Android submit track (optional; credentials may live on EAS)
if grep -q '"android"' eas.json 2>/dev/null; then
  ok "eas.json has android submit config"
else
  warn_msg "eas.json has no submit.production.android — non-interactive submit needs a Play service account on EAS (eas credentials)"
fi

# Version info
version=$(node -e "console.log(require('./app.json').expo.version)" 2>/dev/null || echo "?")
ok "app version $version (android versionCode managed by EAS remote + autoIncrement)"

echo
if [ "$errors" -gt 0 ]; then
  echo "Preflight FAILED ($errors error(s), $warn warning(s)). Fix errors before eas build."
  exit 1
fi

if [ "$warn" -gt 0 ]; then
  echo "Preflight passed with $warn warning(s). Review warnings, then proceed."
else
  echo "Preflight passed. Run:"
  echo "  eas build --platform android --profile production"
  echo "  eas submit --platform android --profile production --latest"
fi
exit 0

#!/usr/bin/env bash
# One-shot production iOS build + App Store Connect submit for cookbook-mobile.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PULL=0
BUILD_ONLY=0
SUBMIT_BUILD_ID=""

usage() {
  cat <<'EOF'
Usage: bash .cursor/skills/apple-upload/scripts/deploy.sh [options]

Options:
  --pull              git pull --ff-only before building
  --build-only        Build on EAS; do not submit to App Store Connect
  --submit-id <id>    Submit an existing EAS build (skips build step)
  -h, --help          Show this help

Examples:
  bash .cursor/skills/apple-upload/scripts/deploy.sh
  bash .cursor/skills/apple-upload/scripts/deploy.sh --pull
  bash .cursor/skills/apple-upload/scripts/deploy.sh --submit-id 903f0ba3-55ec-4445-bda0-2d376d4263e4
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --pull) PULL=1; shift ;;
    --build-only) BUILD_ONLY=1; shift ;;
    --submit-id)
      SUBMIT_BUILD_ID="${2:-}"
      if [ -z "$SUBMIT_BUILD_ID" ]; then
        echo "ERROR: --submit-id requires a build UUID" >&2
        exit 1
      fi
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

COMMIT="unknown"
VERSION="?"
BUILD_NUMBER="?"
BUILD_ID="${SUBMIT_BUILD_ID}"
SUBMIT_ID=""
STATUS="FAILED"
STEP="init"
ASC_APP_ID="6771159239"
TESTFLIGHT_URL="https://appstoreconnect.apple.com/apps/${ASC_APP_ID}/testflight/ios"

report() {
  cat <<EOF

=== Apple Deploy Report ===
Status:       ${STATUS}
Step:         ${STEP}
Commit:       ${COMMIT}
Version:      ${VERSION} (build ${BUILD_NUMBER})
Build ID:     ${BUILD_ID:-n/a}
Submit ID:    ${SUBMIT_ID:-n/a}
Build logs:   ${BUILD_ID:+https://expo.dev/accounts/brett_067/projects/cookbook-mobile/builds/${BUILD_ID}}
Submit logs:  ${SUBMIT_ID:+https://expo.dev/accounts/brett_067/projects/cookbook-mobile/submissions/${SUBMIT_ID}}
TestFlight:   ${TESTFLIGHT_URL}
Next:         Apple processing usually takes 5–30 minutes, then check TestFlight or attach the build for App Store review.
EOF
}

on_error() {
  STATUS="FAILED"
  report >&2
  exit 1
}
trap on_error ERR

if [ -n "$SUBMIT_BUILD_ID" ] && [ "$PULL" -eq 1 ]; then
  echo "ERROR: --pull cannot be used with --submit-id" >&2
  exit 1
fi

if [ -n "$SUBMIT_BUILD_ID" ] && [ "$BUILD_ONLY" -eq 1 ]; then
  echo "ERROR: --build-only cannot be used with --submit-id" >&2
  exit 1
fi

STEP="preflight"
bash "$SCRIPT_DIR/preflight.sh" >/dev/null

if [ "$PULL" -eq 1 ]; then
  STEP="git-pull"
  git pull --ff-only
fi

COMMIT="$(git log -1 --format='%h %s' 2>/dev/null || echo 'unknown')"
VERSION="$(node -e "console.log(require('./app.json').expo.version)" 2>/dev/null || echo '?')"

if [ -z "$SUBMIT_BUILD_ID" ]; then
  STEP="eas-build"
  BUILD_LOG="$(mktemp)"
  if ! eas build --platform ios --profile production --non-interactive 2>&1 | tee "$BUILD_LOG"; then
    rm -f "$BUILD_LOG"
    exit 1
  fi

  BUILD_ID="$(grep -oE 'builds/[0-9a-f-]{36}' "$BUILD_LOG" | tail -1 | sed 's|builds/||')"
  rm -f "$BUILD_LOG"

  if [ -z "$BUILD_ID" ]; then
    echo "ERROR: could not parse build ID from eas build output" >&2
    exit 1
  fi
fi

if [ "$BUILD_ONLY" -eq 1 ]; then
  STATUS="BUILD_ONLY"
  STEP="done"
  report
  exit 0
fi

STEP="eas-submit"
SUBMIT_LOG="$(mktemp)"
if ! eas submit --platform ios --profile production --id "$BUILD_ID" --non-interactive 2>&1 | tee "$SUBMIT_LOG"; then
  rm -f "$SUBMIT_LOG"
  exit 1
fi

SUBMIT_ID="$(grep -oE 'submissions/[0-9a-f-]{36}' "$SUBMIT_LOG" | tail -1 | sed 's|submissions/||')"

if [ "$BUILD_NUMBER" = "?" ]; then
  BUILD_NUMBER="$(grep -E 'Build number:' "$SUBMIT_LOG" | tail -1 | sed 's/.*Build number:[[:space:]]*//' || echo "?")"
fi

if [ "$VERSION" = "?" ]; then
  VERSION="$(grep -E 'App Version :' "$SUBMIT_LOG" | tail -1 | sed 's/.*App Version :[[:space:]]*//' || echo "?")"
fi

rm -f "$SUBMIT_LOG"

if [ -z "$SUBMIT_ID" ]; then
  echo "ERROR: could not parse submission ID from eas submit output" >&2
  exit 1
fi

STATUS="SUCCESS"
STEP="done"
trap - ERR
report

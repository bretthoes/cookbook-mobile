#!/usr/bin/env bash
# Read-only status for a cookbook-mobile iOS Simulator run.
# Prints booted simulators, Metro :8081, API :5055, and whether ios/ exists.
set -u

repo_root="$(cd "$(dirname "$0")/../../../.." && pwd)"

port_state() {
  local port="$1"
  if lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "listening"
  else
    echo "not_listening"
  fi
}

echo "=== iOS Simulator Status ==="
echo "repo: ${repo_root}"

if [[ -d "${repo_root}/ios" ]]; then
  echo "native_project: present"
else
  echo "native_project: missing"
fi

if command -v xcrun >/dev/null 2>&1; then
  booted="$(xcrun simctl list devices booted 2>&1)" || booted="xcrun simctl failed: ${booted}"
  booted_lines="$(printf '%s\n' "${booted}" | grep '(Booted)' || true)"
  if [[ -n "${booted_lines}" ]]; then
    echo "booted_devices:"
    printf '%s\n' "${booted_lines}" | sed 's/^[[:space:]]*/  /'
  else
    echo "booted_devices: none"
  fi
else
  echo "booted_devices: xcrun not found"
fi

echo "metro_8081: $(port_state 8081)"
echo "api_5055: $(port_state 5055)"

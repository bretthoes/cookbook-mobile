#!/usr/bin/env bash
# Read-only status for a cookbook-mobile Android emulator run.
# Prints connected devices, AVDs, Metro :8081, API :5055, and whether android/ exists.
set -u

repo_root="$(cd "$(dirname "$0")/../../../.." && pwd)"

android_sdk() {
  if [[ -n "${ANDROID_HOME:-}" ]]; then
    echo "${ANDROID_HOME}"
    return
  fi
  if [[ -n "${ANDROID_SDK_ROOT:-}" ]]; then
    echo "${ANDROID_SDK_ROOT}"
    return
  fi
  if [[ -d "${HOME}/Library/Android/sdk" ]]; then
    echo "${HOME}/Library/Android/sdk"
    return
  fi
  echo ""
}

find_tool() {
  local name="$1"
  local subpath="$2"
  if command -v "${name}" >/dev/null 2>&1; then
    command -v "${name}"
    return
  fi
  local sdk
  sdk="$(android_sdk)"
  if [[ -n "${sdk}" && -x "${sdk}/${subpath}" ]]; then
    echo "${sdk}/${subpath}"
    return
  fi
  echo ""
}

port_state() {
  local port="$1"
  if lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "listening"
  else
    echo "not_listening"
  fi
}

echo "=== Android Emulator Status ==="
echo "repo: ${repo_root}"

if [[ -d "${repo_root}/android" ]]; then
  echo "native_project: present"
else
  echo "native_project: missing"
fi

sdk="$(android_sdk)"
if [[ -n "${sdk}" ]]; then
  echo "sdk: ${sdk}"
else
  echo "sdk: not_found"
fi

adb_bin="$(find_tool adb platform-tools/adb)"
if [[ -n "${adb_bin}" ]]; then
  echo "adb: ${adb_bin}"
  devices="$("${adb_bin}" devices 2>&1)" || devices="adb devices failed: ${devices}"
  connected="$(printf '%s\n' "${devices}" | awk 'NR>1 && $2=="device" { print $1 }')"
  if [[ -n "${connected}" ]]; then
    echo "connected_devices:"
    printf '%s\n' "${connected}" | sed 's/^/  /'
  else
    echo "connected_devices: none"
  fi
else
  echo "adb: not_found"
  echo "connected_devices: none"
fi

emulator_bin="$(find_tool emulator emulator/emulator)"
if [[ -n "${emulator_bin}" ]]; then
  echo "emulator: ${emulator_bin}"
  avds="$("${emulator_bin}" -list-avds 2>&1)" || avds=""
  avds="$(printf '%s\n' "${avds}" | sed '/^$/d')"
  if [[ -n "${avds}" ]]; then
    echo "avds:"
    printf '%s\n' "${avds}" | sed 's/^/  /'
  else
    echo "avds: none"
  fi
else
  echo "emulator: not_found"
  echo "avds: none"
fi

echo "metro_8081: $(port_state 8081)"
echo "api_5055: $(port_state 5055)"

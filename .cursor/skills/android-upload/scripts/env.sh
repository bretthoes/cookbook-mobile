#!/usr/bin/env bash
# Use Windows-hosted eas/node when bash runs under WSL (pnpm shim breaks on Linux uname).

is_wsl() {
  grep -qiE '(microsoft|wsl)' /proc/version 2>/dev/null
}

setup_wsl_windows_tooling() {
  local wrap
  wrap="$(mktemp -d)"

  cat > "$wrap/eas" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
win_pwd="$(wslpath -w "$(pwd)" | tr '\\' '/')"
args=""
for arg in "$@"; do
  if [[ "$arg" == *[![:print:]]* ]] || [[ "$arg" == *" "* ]] || [[ "$arg" == *\"* ]]; then
    arg="${arg//\\/\\\\}"
    arg="${arg//\"/\\\"}"
    args="$args \"$arg\""
  else
    args="$args $arg"
  fi
done
cmd.exe /c "cd /d $win_pwd && set \"PATH=C:\Program Files\nodejs;C:\Users\brett\AppData\Local\pnpm;C:\Users\brett\AppData\Roaming\npm\" && set NODE_PATH= && eas$args"
EOF

  cat > "$wrap/node" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
win_pwd="$(wslpath -w "$(pwd)" | tr '\\' '/')"
args=""
for arg in "$@"; do
  if [[ "$arg" == *[![:print:]]* ]] || [[ "$arg" == *" "* ]] || [[ "$arg" == *\"* ]]; then
    arg="${arg//\\/\\\\}"
    arg="${arg//\"/\\\"}"
    args="$args \"$arg\""
  else
    args="$args $arg"
  fi
done
cmd.exe /c "cd /d $win_pwd && set \"PATH=C:\Program Files\nodejs;C:\Users\brett\AppData\Local\pnpm;C:\Users\brett\AppData\Roaming\npm\" && set NODE_PATH= && node$args"
EOF

  chmod +x "$wrap/eas" "$wrap/node"
  export PATH="$wrap:$PATH"
}

if is_wsl; then
  if eas whoami >/dev/null 2>&1; then
    :
  elif cmd.exe /c eas whoami >/dev/null 2>&1; then
    setup_wsl_windows_tooling
  fi
fi

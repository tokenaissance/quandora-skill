#!/bin/sh
set -eu
umask 077

APP_ROOT=${1:-/Applications/WorkBuddy.app}
CONFIG_ROOT=${2:-"$HOME/.workbuddy"}
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
PLUGIN_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd -P)
ELECTRON_BIN="$APP_ROOT/Contents/MacOS/Electron"
OAUTH_HELPER="$SCRIPT_DIR/workbuddy-cn-oauth-macos.js"

if [ "$(/usr/bin/uname -s)" != "Darwin" ]; then
  echo '{"status":"failed","message":"This WorkBuddy China helper supports macOS only."}' >&2
  exit 69
fi

if [ ! -x "$ELECTRON_BIN" ] || [ ! -f "$OAUTH_HELPER" ]; then
  echo '{"status":"failed","message":"The WorkBuddy native OAuth runtime is unavailable."}' >&2
  exit 69
fi

ELECTRON_RUN_AS_NODE=1 "$ELECTRON_BIN" \
  "$OAUTH_HELPER" "$PLUGIN_ROOT" "$CONFIG_ROOT" "$APP_ROOT"

#!/usr/bin/env bash
# ============================================================================
# GRIMOIRE customer provisioning — one script from blank VPS to paired agent.
#
#   Usage (on a fresh root VPS, Ubuntu 24.04):
#     curl -fsSL https://grimoire.epinoiahorizon.com/grimoire.sh | bash
#
#   Env knobs (all optional):
#     GRIMOIRE_PLAN=solo|assist|partner   (default: solo)
#     GRIMOIRE_TELEGRAM=@handle           (customer's handle, goes into allowlist note)
#     GRIMOIRE_BASE_URL                   (default: https://grimoire.epinoiahorizon.com)
#
#   Contract (GRIMOIRE-OPS.md): blank Ubuntu 24.04 root → gateway running,
#   config stamped v51, provisioning state JSON dropped, pairing link printed.
#   Time-to-paired target: < 15 min on a CX22-class box.
# ============================================================================
set -euo pipefail

PLAN="${GRIMOIRE_PLAN:-solo}"
TELEGRAM="${GRIMOIRE_TELEGRAM:-unspecified}"
BASE_URL="${GRIMOIRE_BASE_URL:-https://grimoire.epinoiahorizon.com}"
MERLIN_HOME="${MERLIN_HOME:-$HOME/.merlin}"
AGENT_DIR="$MERLIN_HOME/merlin-agent"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
MACHINE_ID="$(cat /etc/machine-id 2>/dev/null || hostname)"

log() { printf '\033[36m  ✓\033[0m %s\n' "$*"; }
stage() { printf '\n\033[33m→ GRIMOIRE %-14s\033[0m\n' "$1"; }

fail() {
  printf '\033[31m✗ %s\033[0m\n' "$*" >&2
  printf '{"status":"failed","stage":"%s","machine_id":"%s","stamp":"%s"}\n' \
    "$1" "$MACHINE_ID" "$STAMP" > "$MERLIN_HOME/grimoire_state.json" 2>/dev/null || true
  exit 1
}

require_root() { [ "$(id -u)" = "0" ] || fail prereq "run as root (fresh VPS contract)"; }

# ─── Stage 1: system deps ───────────────────────────────────────────────────
stage "deps"
if command -v apt-get >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq curl git ca-certificates jq tmux cron >/dev/null
  log "apt deps in place"
else
  fail deps "only Ubuntu/Debian supported in v0.3 (customer contract)"
fi
command -v jq >/dev/null || fail deps "jq missing after install"

# ─── Stage 2: merlin install (upstream installer, pinned release) ───────────
stage "install-merlin"
if [ ! -d "$AGENT_DIR/.git" ]; then
  # Primary: canonical installer at its real repo path (grimoire host's own
  # merlin-install.sh died with the VPS migration — do not fall back to it).
  curl -fsSL https://raw.githubusercontent.com/epinoiahorizon/Merlin-Agent/main/scripts/install.sh | bash -s -- --branch main \
    || fail install "merlin installer failed (raw.githubusercontent.com/scripts/install.sh unreachable)"
fi
[ -x "$MERLIN_HOME/bin/merlin" ] || [ -x "$HOME/.local/bin/merlin" ] || fail install "merlin binary not on disk"
log "merlin installed at $AGENT_DIR"

# ─── Stage 3: Grimoire product config (solarized + compact + auto_load) ─────
stage "product-config"
mkdir -p "$MERLIN_HOME"
if [ ! -f "$MERLIN_HOME/config.yaml" ]; then
  # Seed from the installer template, then pin plan-specific product surface.
  if [ -f "$AGENT_DIR/cli-config.yaml.example" ]; then
    cp "$AGENT_DIR/cli-config.yaml.example" "$MERLIN_HOME/config.yaml"
  else
    fail config "template missing (install stage)"
  fi
fi
python3 - "$MERLIN_HOME/config.yaml" "$PLAN" << 'PYEOF' || fail config "config pin failed"
import sys, re
path, plan = sys.argv[1], sys.argv[2]
t = open(path, encoding="utf-8").read()
t = re.sub(r'^  skin: .*$', '  skin: solarized', t, flags=re.M)
t = re.sub(r'^  compact: .*$', '  compact: true', t, flags=re.M)
open(path, "w", encoding="utf-8").write(t)
print(f"pinned solarized/compact for plan={plan}")
PYEOF
log "Grimoire product config active (v51, solarized)"

# ─── Stage 4: gateway up + health ───────────────────────────────────────────
stage "gateway"
MERLIN_BIN="$HOME/.local/bin/merlin"; [ -x "$MERLIN_BIN" ] || MERLIN_BIN="$MERLIN_HOME/bin/merlin"
"$MERLIN_BIN" gateway restart >/dev/null 2>&1 || "$MERLIN_BIN" gateway start >/dev/null 2>&1 || true
sleep 4
# gateway_state.json parse — status grep (Main PID), file fallback.
GW_PID=$("$MERLIN_BIN" gateway status 2>/dev/null | grep -oE 'Main PID: [0-9]+' | grep -oE '[0-9]+' | head -1 || true)
if [ -z "$GW_PID" ] && [ -f "$MERLIN_HOME/gateway_state.json" ]; then
  GW_PID=$(python3 -c "import json;print(json.load(open('$MERLIN_HOME/gateway_state.json')).get('pid',''))" 2>/dev/null || true)
fi
[ -n "$GW_PID" ] && kill -0 "$GW_PID" 2>/dev/null \
  && log "gateway running (pid $GW_PID)" \
  || fail gateway "gateway not healthy after start"

CODE_SHA=$(python3 -c "import json;print(json.load(open('$MERLIN_HOME/gateway_state.json')).get('code_sha','unknown'))" 2>/dev/null || echo unknown)
log "serving code: $CODE_SHA"

# ─── Stage 5: cron skeleton (customer jobs template dir) ────────────────────
stage "cron-templates"
mkdir -p "$MERLIN_HOME/grimoire/cron-templates"
log "cron template dir ready (onboard step fills it)"

# ─── Stage 6: provisioning state + pairing handoff ──────────────────────────
stage "pairing"
STATE="$MERLIN_HOME/grimoire_state.json"
jq -n --arg id "$MACHINE_ID" --arg plan "$PLAN" --arg tg "$TELEGRAM" \
      --arg stamp "$STAMP" --arg sha "$CODE_SHA" \
  '{status:"provisioned", machine_id:$id, plan:$plan, telegram:$tg,
    stamped_at:$stamp, code_sha:$sha, config_version:"v51"}' > "$STATE"
log "state: $STATE"

echo
echo "════════════════════════════════════════════════════════════"
echo "  ᛟ  GRIMOIRE provisioned — plan: $PLAN  ·  node: ${MACHINE_ID:0:8}"
echo "════════════════════════════════════════════════════════════"
echo
echo "  LAST STEP (human, 1 minute):"
echo "  1. Run:  $MERLIN_BIN  gateway setup        (choose Telegram, get the bot token in)"
echo "  2. From your Telegram, send any message to the bot — a pairing code appears on the VPS"
echo "  3. Approve it:   $MERLIN_BIN  pairing approve"
echo "  4. Send 'morning brief' — tomorrow you get your first brief."
echo
echo "  Need help? @grimoire_support on Telegram."
echo "════════════════════════════════════════════════════════════"
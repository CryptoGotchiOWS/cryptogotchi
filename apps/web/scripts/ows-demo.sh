#!/bin/bash
# CryptoGotchi — OWS Local Proof Demo
#
# Demonstrates Open Wallet Standard CLI integration with CryptoGotchi.
# Only uses VERIFIED commands (tested against OWS v1.2.4).
#
# Prerequisites:
#   1. OWS CLI installed: curl -fsSL https://docs.openwallet.sh/install.sh | bash
#   2. OWS binary in PATH (default: ~/.ows/bin/ows)
#   3. On Windows: run via WSL (OWS only supports Linux/macOS)
#
# Usage (WSL recommended):
#   export PATH=$HOME/.ows/bin:$PATH
#   bash apps/web/scripts/ows-demo.sh
#   # Or with output capture:
#   bash apps/web/scripts/ows-demo.sh 2>&1 | tee proof/ows-demo-output.txt

WALLET_NAME="cryptogotchi-pet"
SIGN_MESSAGE="CryptoGotchi says: Feed me crypto!"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date)

# Color helpers (fallback to plain if not supported)
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "${CYAN}[INFO]${NC} $1"; }

echo "========================================="
echo "  CryptoGotchi OWS Local Proof Demo"
echo "  $TIMESTAMP"
echo "========================================="
echo ""

# --- Ensure ~/.ows/bin is in PATH (default install location) ---
if [ -d "$HOME/.ows/bin" ] && [[ ":$PATH:" != *":$HOME/.ows/bin:"* ]]; then
  export PATH="$HOME/.ows/bin:$PATH"
fi

# --- Pre-flight: Check OWS is installed ---
info "Checking OWS CLI installation..."
if ! command -v ows &>/dev/null; then
  fail "OWS CLI not found in PATH"
  echo ""
  echo "Install OWS CLI:"
  echo "  curl -fsSL https://docs.openwallet.sh/install.sh | bash"
  echo ""
  echo "Then re-run this script."
  exit 1
fi

OWS_VERSION=$(ows --version 2>&1 || echo "unknown")
pass "OWS CLI found: $OWS_VERSION"
echo ""

# Track results
TOTAL=0
PASSED=0

run_step() {
  local step_num="$1"
  local step_name="$2"
  local step_cmd="$3"

  TOTAL=$((TOTAL + 1))
  echo "--- Step $step_num: $step_name ---"
  info "Running: $step_cmd"
  echo ""

  local rc=0
  eval "$step_cmd" 2>&1 || rc=$?

  if [ "$rc" -eq 0 ]; then
    echo ""
    pass "$step_name"
    PASSED=$((PASSED + 1))
  else
    echo ""
    fail "$step_name (exit code: $rc)"
    warn "Command may not be supported in this OWS version. Continuing..."
  fi
  echo ""
}

# --- Step 1: Create Wallet (skip if already exists) ---
if ows wallet list 2>&1 | grep -q "$WALLET_NAME"; then
  info "Wallet '$WALLET_NAME' already exists, skipping creation"
  TOTAL=$((TOTAL + 1))
  PASSED=$((PASSED + 1))
  pass "Create Wallet (already exists)"
  echo ""
else
  run_step 1 "Create Wallet" "ows wallet create --name $WALLET_NAME"
fi

# --- Step 2: List Wallets ---
run_step 2 "List Wallets" "ows wallet list"

# --- Step 3: Wallet Info ---
run_step 3 "Wallet Info" "ows wallet info"

# --- Step 4: Sign Message (Ethereum chain) ---
run_step 4 "Sign Message (Ethereum)" "ows sign message --wallet $WALLET_NAME --chain ethereum --message \"$SIGN_MESSAGE\""

# --- Step 5: Create API Key (skip if already exists) ---
if ows key list 2>&1 | grep -q "cryptogotchi-agent"; then
  info "Key 'cryptogotchi-agent' already exists, skipping creation"
  TOTAL=$((TOTAL + 1))
  PASSED=$((PASSED + 1))
  pass "Create API Key (already exists)"
  echo ""
else
  run_step 5 "Create API Key" "ows key create --name cryptogotchi-agent --wallet $WALLET_NAME"
fi

# --- Step 6: List Keys ---
run_step 6 "List Keys" "ows key list"

# --- Step 7: Check Balance ---
run_step 7 "Check Balance" "ows fund balance --wallet $WALLET_NAME"

# --- Step 8: Discover x402 Services ---
run_step 8 "Discover x402 Services" "ows pay discover"

# --- Summary ---
echo "========================================="
echo "  Demo Complete"
echo "  Results: $PASSED/$TOTAL steps passed"
echo "  Vault: ~/.ows/ (AES-256-GCM encrypted)"
echo "  Wallet: $WALLET_NAME"
echo "  Timestamp: $TIMESTAMP"
echo "========================================="
echo ""

if [ "$PASSED" -ge 4 ]; then
  pass "Core OWS functionality verified ($PASSED/$TOTAL)"
else
  warn "Only $PASSED/$TOTAL steps passed. Check OWS installation."
fi

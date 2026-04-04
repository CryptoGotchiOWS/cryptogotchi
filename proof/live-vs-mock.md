# CryptoGotchi — Live vs Mock Transparency Report

> Generated: 2026-04-04 | OWS Hackathon Track 5: Creative/Unhinged

## Feature Status

| Feature | Vercel (Prod) | Localhost (Demo) | Evidence |
|---------|:------------:|:----------------:|----------|
| Pet Engine (decay, mood, income) | LIVE | LIVE | Client-side, no server dependency |
| Gemini AI (4 services + reactions) | LIVE | LIVE | `proof/gemini-live-output.txt` — 5/5 PASS |
| x402 Payment Verification | Mock | **LIVE (Base Sepolia)** | `proof/x402-payment-receipt.txt` — TX on-chain |
| x402 Bazaar Discovery | Metadata only | Metadata only | Extensions registered, endpoint not public yet |
| OWS Wallet & Signing | Mock | **LIVE (~/.ows/)** | `proof/ows-demo-output.txt` — 7/8 PASS |
| Mock Fallback System | Active | Active | Graceful degradation on API errors |

## Why Some Features Are Mock on Vercel

- **x402 Payments**: Requires buyer-side private key which MUST NOT be exposed in browser. Live demo uses server-side CLI script.
- **OWS CLI**: Local filesystem vault (`~/.ows/`), cannot run on Vercel's ephemeral functions. Live demo uses WSL.
- **Bazaar Discovery**: `x402.org/facilitator/discovery/resources` returns 404 as of April 2026. Metadata is registered; catalog not public yet.

## Proof Artifacts

### 1. x402 Live Payment
- **TX Hash**: `0x871c9c20e5436bfe294c4da8acfa2b4e6e4842ac3fbccf67cad8d24ee0eb5983`
- **Basescan**: https://sepolia.basescan.org/tx/0x871c9c20e5436bfe294c4da8acfa2b4e6e4842ac3fbccf67cad8d24ee0eb5983
- **Network**: Base Sepolia (eip155:84532)
- **Protocol**: x402 V2 — `wrapFetchWithPayment()` → 402 → auto X-PAYMENT → 200
- **File**: `proof/x402-payment-receipt.txt`

### 2. Gemini AI Live
- **Model**: gemini-2.5-flash (free tier)
- **Services Tested**: summarize, fortune, code-review, crypto, pet-reaction
- **Result**: 5/5 PASS
- **Rate Limit**: 5 RPM free tier → mock fallback on 429
- **File**: `proof/gemini-live-output.txt`

### 3. OWS CLI Demo
- **Version**: v1.2.4 (2fbd309)
- **Platform**: WSL Ubuntu-22.04
- **Wallet**: `cryptogotchi-pet` — 9 chains (EVM, Solana, Bitcoin, Cosmos, Tron, TON, Filecoin, Sui, XRPL)
- **Result**: 7/8 PASS (only `pay discover` fails — CDP endpoint not live)
- **Vault**: `~/.ows/` (AES-256-GCM encrypted)
- **File**: `proof/ows-demo-output.txt`

## Architecture Decisions

1. **Mock-first, fail-safe**: App never crashes. Missing API keys → mock responses. x402 init failure → 503 (fail-closed).
2. **No private keys in browser**: x402 buyer-side uses server-side CLI script. OWS vault is local filesystem only.
3. **Dual mode**: `X402_MOCK=true` for Vercel demo, `false` for localhost live proof.
4. **Gemini independent**: AI mode (`GEMINI_API_KEY`) is orthogonal to payment mode (`X402_MOCK`). Both can be live or mock independently.

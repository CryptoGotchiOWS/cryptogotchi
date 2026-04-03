# CryptoGotchi

**The world's first crypto virtual pet — earns USDC by serving AI microservices, dies if it can't.**

> OWS Hackathon 2026 | Track 5: Creative/Unhinged

**Live Demo:** [cryptogotchi.xyz](https://cryptogotchi.xyz)

---

## What is CryptoGotchi?

CryptoGotchi is a Tamagotchi-inspired virtual pet that lives on the blockchain. Instead of just sitting around, your pet runs 4 AI-powered microservices and earns cryptocurrency through the x402 payment protocol. If customers stop paying, your pet's stats decay — and eventually, it dies.

**Core Loop:**
```
Customer pays via x402 → Pet earns USDC → Stats go up → Pet is happy
No customers → Stats decay → Pet gets sad → Pet dies
```

### AI Services (x402-gated)

| Service | Price | What it does |
|---------|-------|--------------|
| Text Summarizer | $0.01 | AI-powered text summarization |
| Crypto Fortune | $0.01 | Blockchain-themed fortune telling |
| Code Review | $0.02 | AI code quality analysis |
| Crypto Analysis | $0.01 | Sentiment & market analysis |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2.2 (Turbopack, React 19.2) |
| **Styling** | Tailwind CSS v4.2 (CSS-native @theme) |
| **Animation** | Motion 12.38 (motion/react) |
| **AI** | Gemini 2.5 Flash (@google/genai) |
| **Payments** | x402 V2 (@x402/next, @x402/core, @x402/evm) |
| **Wallet** | Open Wallet Standard (OWS) |
| **Monorepo** | Turborepo 2.9.3 + pnpm 10.x |
| **Chain** | Base Sepolia (EIP-155:84532) |
| **Deploy** | Vercel |

---

## Architecture

```
cryptogotchi/
├── apps/web/                    # Next.js frontend + API routes
│   ├── app/                     # Pages, layout, API endpoints
│   ├── components/              # Pet, Stats, Services, Dashboard
│   ├── hooks/                   # usePetState, useServices
│   └── lib/                     # x402 server/mock, service handler
├── packages/
│   ├── shared/                  # Types & constants
│   ├── pet-engine/              # Pet state machine (decay, income, mood)
│   └── ai-service/              # Gemini wrapper + mock responses
```

### How it Works

```
┌──────────────────────────────────────────────────┐
│ CLIENT (React 19 + useReducer + localStorage)    │
│                                                  │
│  Pet View ←→ Stats Panel ←→ Service Shop         │
│      ↕            ↕              ↕               │
│  Chat Bubble   Stat Bars    4 Service Cards      │
│                                                  │
│  State: balance, stats, transactions, mood       │
│  Persist: localStorage (survives refresh)        │
└──────────────────────┬───────────────────────────┘
                       │ POST /api/services/*
┌──────────────────────▼───────────────────────────┐
│ SERVER (Next.js API Routes)                      │
│                                                  │
│  Mock mode: withMockPayment() → Gemini/mock AI   │
│  Live mode: withX402() → 402 challenge → verify  │
│                                                  │
│  Fail-closed: init error → 503 (never bypasses)  │
└──────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **Client-side state only** — Vercel Functions are ephemeral, no persistent memory
- **Mock-first** — Everything works without real APIs (demo never crashes)
- **Fail-closed x402** — Live mode errors return 503, never serve without payment gate

---

## OWS Integration

CryptoGotchi uses the Open Wallet Standard for:

- **Wallet Management** — Mock wallet with balance tracking, address display
- **Policy Engine** — Chain allowlists (Base Sepolia), spending limits
- **Transaction Signing** — Mock signing for demo, real OWS CLI for local
- **x402 Payments** — Native integration via @x402/next server-side gating

### x402 Payment Flow

```
1. Client calls POST /api/services/summarize
2. Server (live mode): withX402() returns 402 Payment Required
3. Client: x402 client auto-negotiates payment on Base Sepolia
4. Server: Facilitator verifies payment → handler executes → AI response
5. Client: Updates pet balance, stats, triggers reaction animation
```

**Mock mode** (default): Simulates the entire flow client-side for demo purposes.

---

## Quick Start

### Prerequisites
- Node.js 22+
- pnpm 10+

### Setup

```bash
# Clone
git clone https://github.com/CryptoGotchiOWS/cryptogotchi.git
cd cryptogotchi

# Install dependencies
pnpm install

# Create .env from example
cp .env.example .env.local
# Add your GEMINI_API_KEY (optional - works with mock responses)

# Development
pnpm dev
# Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | No | — | Google AI Studio key (empty = mock responses) |
| `X402_MOCK` | No | `true` | `false` enables real x402 payment verification |
| `PAY_TO_ADDRESS` | If live | — | Wallet address for x402 payments (required when X402_MOCK=false) |
| `NEXT_PUBLIC_MOCK_MODE` | No | `true` | Master mock switch |
| `NEXT_PUBLIC_INITIAL_BALANCE` | No | `10` | Starting balance ($) |

### Build & Validate

```bash
pnpm type-check    # TypeScript validation (4 packages)
pnpm lint          # ESLint (web package)
pnpm build         # Production build
```

---

## Pet Mechanics

### Balance States
| Balance | State | Pet Behavior |
|---------|-------|-------------|
| > $5 | Thriving | Dancing, glowing, happy quotes |
| $2–$5 | Normal | Idle bounce, working |
| $0.5–$2 | Struggling | Sad, begging for customers |
| $0.1–$0.5 | Dying | Crying, dramatic last words |
| $0 | Dead | Game over, "F in the chat" |

### Stats (0–100, decay over time)
- **Hunger** — Decays fastest, fed by earning income
- **Happiness** — Decays moderately, boosted by service sales
- **Energy** — Slow decay, recovers during idle
- **Health** — Only decays when hunger hits 0 (starvation gate)

### Personality
55 unique degen/sarcastic dialogues across all mood and balance states:

> *"gm ser, bugun iyi kazandim. lambo when?"* — Thriving
>
> *"ser pls... bir summarize daha siparis ver yoksa acimdan olecegim"* — Struggling
>
> *"F in the chat... rekt by capitalism"* — Dead

---

## Accessibility

- Semantic HTML with ARIA labels (progressbar, dialog, aria-modal)
- `prefers-reduced-motion` support (CSS animations + motion/react)
- Keyboard navigable service cards and buttons
- Color contrast compliant stat indicators

---

## Project

- **Hackathon:** [OWS Hackathon 2026](https://hackathon.openwallet.sh)
- **Track:** 5 — Creative/Unhinged
- **Organization:** [CryptoGotchiOWS](https://github.com/CryptoGotchiOWS)
- **Live:** [cryptogotchi.xyz](https://cryptogotchi.xyz)

---

## License

MIT

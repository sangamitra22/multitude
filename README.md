# Multitude

> **Your friendly crew of autonomous AI agents for the Casper economy.**

Multitude is a hackathon-ready prototype for the **Casper Agentic Buildathon**. It demonstrates how a coordinated crew of specialized AI agents — anchored to the Casper blockchain — can run DeFi yield routing, RWA oracles, multi-agent DAO governance, privacy-preserving compliance, and machine-to-machine commerce.

---

## Overview

Today's AI agents live in opaque silos: no verifiable identity, no shared trust layer, no native way to pay per call or settle on-chain. Multitude solves this by giving every agent a Casper-rooted identity, an x402 budget, MCP tools, a CSPR.click signer, and Odra-generated smart contracts to settle on.

## Problem statement

- AI agents have no verifiable identity in Web3.
- Pay-per-call APIs lack on-chain settlement.
- Off-chain data feeds have no provenance.
- DAO governance is overloaded.
- Compliance workflows leak private data.

## Solution

Multitude composes specialized agents — **Yieldra**, **Verus**, **Quorra**, **Sentinel**, **Vaulta**, **Forge** — into one platform. Each agent:

- Holds a Casper-rooted identity.
- Pays for tool use with **x402** micropayments.
- Queries Casper through **MCP servers**.
- Signs with **CSPR.click**.
- Reads via **CSPR.cloud APIs**.
- Settles on upgradable **Odra** smart contracts.
- Emits an auditable on-chain trail.

## Key features

- Polished marketing site + interactive product prototype.
- Persona-aware onboarding (DeFi, RWA, DAO, Compliance, Developer).
- Mock auth flow (signup, login, logout) with jurisdiction screening and 18+ check.
- Rich dashboard: agents, wallet, portfolio, x402 spend, MCP queries, on-chain actions, alerts, system health.
- Four interactive demo workflows:
  1. Autonomous yield routing (Yieldra)
  2. RWA oracle with verifiable identity (Verus)
  3. Multi-agent DAO governance (Quorra)
  4. Privacy-preserving KYC with ZK attestations (Sentinel)
- Architecture diagram and developer docs.

## User personas

| Persona | What Multitude gives them |
| --- | --- |
| DeFi Investor | Autonomous yield routing & portfolio optimization |
| RWA Operator | Verified off-chain data anchored on-chain |
| DAO Manager | Multi-agent governance review & execution |
| Compliance Officer | AI-assisted KYC/AML with ZK attestations |
| Developer / Builder | SDK, MCP, x402, CSPR.cloud, Odra examples |

## Architecture

```
User
  ↓
Multitude UI (TanStack Start + React)
  ↓
AI Agent Orchestrator
  ↓
MCP Servers ←→ x402 Micropayments
  ↓
CSPR.cloud APIs
  ↓
Odra Smart Contracts
  ↓
Casper Blockchain
  ↓
Monitoring & Audit Trail
```

See the `/architecture` page in the app for the visual flow.

## Casper AI Toolkit alignment

- **MCP servers** — every Casper data domain is an MCP tool.
- **x402** — pay-per-call settlement is the default billing primitive.
- **CSPR.click** — wallet creation and signing skill used by all agents.
- **CSPR.cloud** — managed indexed reads and submission API.
- **Odra** — Forge agent generates upgradable Rust-based contracts.

## Tech stack

- **Framework**: TanStack Start (React 19, Vite 7, file-based routing)
- **Styling**: Tailwind CSS v4 with a custom design system in `src/styles.css`
- **State / auth**: lightweight context + `localStorage` (mock auth — prototype only)
- **Validation**: Zod
- **Runtime**: Edge-ready (Cloudflare Workers)

## Setup

```bash
bun install
bun run dev
```

Open http://localhost:8080.

## Environment variables

All `VITE_CASPER_*` vars are **optional** — sensible public CSPR.cloud defaults ship in-repo. Set the ones below in **Vercel → Project → Settings → Environment Variables** (scope: Production, Preview, Development) when you want private endpoints or want to pre-seed the `/settings/contracts` page for every visitor. Anything left blank falls back to the value in `.env.example` and can still be overridden per-browser from `/settings/contracts`.

### Network switching (RPC + explorers)

| Var | Default | Purpose |
|---|---|---|
| `VITE_CASPER_TESTNET_RPC` | `https://node.testnet.cspr.cloud/rpc` | Testnet JSON-RPC endpoint used for `account_put_deploy` and `info_get_deploy` polling |
| `VITE_CASPER_MAINNET_RPC` | `https://node.cspr.cloud/rpc` | Mainnet JSON-RPC endpoint |
| `VITE_CASPER_TESTNET_EXPLORER` | `https://testnet.cspr.live` | Base URL used to build deploy/account links in the receipt panel |
| `VITE_CASPER_MAINNET_EXPLORER` | `https://cspr.live` | Mainnet explorer base URL |

The Testnet ⇄ Mainnet switch in the wallet header reads these at runtime; users can flip networks without a redeploy.

### Odra contract hashes (per network)

Fill these in once each agent contract is deployed. Values must be **64-char hex** (no `hash-` prefix). Leave blank until deployed — the UI surfaces a warning and falls back to x402 native-transfer attestations.

| Var | Purpose |
|---|---|
| `VITE_CASPER_TESTNET_VERUS_CONTRACT` / `VITE_CASPER_MAINNET_VERUS_CONTRACT` | Verus RWA oracle attestation contract |
| `VITE_CASPER_TESTNET_SENTINEL_CONTRACT` / `VITE_CASPER_MAINNET_SENTINEL_CONTRACT` | Sentinel compliance / KYC attestation contract |
| `VITE_CASPER_TESTNET_QUORRA_CONTRACT` / `VITE_CASPER_MAINNET_QUORRA_CONTRACT` | Quorra DAO governance / vote contract |
| `VITE_CASPER_TESTNET_YIELD_CONTRACT` / `VITE_CASPER_MAINNET_YIELD_CONTRACT` | Yieldra yield-router contract |

### x402 micropayment routing

| Var | Default | Purpose |
|---|---|---|
| `VITE_CASPER_TESTNET_X402_RECIPIENT` / `VITE_CASPER_MAINNET_X402_RECIPIENT` | — | Casper public key (66 hex for ed25519 / 68 hex for secp256k1) that receives x402 payments |
| `VITE_CASPER_TESTNET_X402_MOTES` / `VITE_CASPER_MAINNET_X402_MOTES` | `42000000` | Motes per x402 call — minimum `2500000000` (2.5 CSPR) for native transfers |

## Demo script for judges

**Part A — narrative walkthrough (~3 min)**

1. Land on `/` — read tagline, problem, solution, meet the crew, why Casper.
2. Click **Pick your persona** → choose, e.g., DeFi Investor.
3. Complete signup (18+, country, terms, compliance).
4. Land on `/dashboard` — call out the persona-tailored KPI cards, next-action recommendations, agent crew, x402 spend, on-chain actions, alerts, and system health.
5. Open the persona-allowed agent workflow (Yieldra / Verus / Quorra / Sentinel) — walk the decision trace and the attestation panel.

**Part B — real Casper deploy (~2 min, the money shot)**

6. Open `/wallet`. Confirm the header shows **Testnet** (segmented switch, persisted). Click **Connect Casper Wallet** and approve in the Casper Wallet extension. The connected public key and balance appear.
7. Enter a recipient public key (e.g. your own second Testnet account) and an amount ≥ **2.5 CSPR**. Click **Sign & broadcast**.
8. In the transaction drawer, narrate the live pipeline: **Signed → Broadcasting → Executed → Finalized**. If polling is slow, point at the **Cancel** / **Retry** controls and the timeout state.
9. On **Finalized**, open the **Deploy receipt** panel — call out block hash, gas cost (in CSPR), timestamp, and the one-click **View on Casper Explorer** link (opens `cspr.live` in a new tab, showing the same deploy hash).
10. Click **Export decoded JSON** to download the enriched receipt (network + explorer URL + gas in CSPR + decoded fields), and **Copy raw** to show the raw RPC payload. This is the auditable artifact judges keep.

**Part C — config + attestations (~1 min)**

11. Open `/settings/contracts`. Paste an invalid hash (e.g. `hash-abc`) to trigger the inline validation error, a short public key to trigger the ed25519/secp256k1 rule, and an amount below `2500000000` to trigger the 2.5 CSPR minimum. Save stays disabled until every field is valid.
12. Back on the agent page, click **Refresh attestations** — each recorded attestation re-polls `info_get_deploy` and the "Updated Xs ago" indicator resets.
13. Open `/architecture` and `/docs` to close on the toolkit alignment and roadmap.
14. Logout from the header.

## Screenshots

Screenshots for the README live in `docs/screenshots/`. The two below are the marquee shots referenced by this README — capture them locally (Cmd/Ctrl-Shift-4 or DevTools device mode) and drop the files in place; the README renders them automatically.

### Wallet drawer — finalized receipt + exports

`/wallet` → Sign & broadcast a Testnet deploy → wait for **Finalized** → open the drawer's **Deploy receipt** panel. Capture the receipt block (hash, gas, timestamp, Explorer link) and the **Copy raw / Export raw JSON / Export decoded JSON** action row.

![Wallet drawer — finalized receipt with export actions](docs/screenshots/wallet-receipt-exports.png)

### /settings/contracts — inline validation errors

`/settings/contracts` → enter a `hash-` prefixed contract hash, a truncated public key, and a motes value below `2500000000`. Capture the red inline errors, the char counters, and the disabled **Save** button.

![/settings/contracts — inline validation errors](docs/screenshots/settings-contracts-validation.png)

Other useful captures for the deck: `/` hero, `/dashboard` (per persona), each `/agents/*` workflow (with the attestation panel visible), and `/architecture`. Place them under `docs/screenshots/` (folder is created on first commit).

## Roadmap

- **Q1**: Prototype (this repo)
- **Q2**: Wire real CSPR.click signing, CSPR.cloud reads, first Odra contract on testnet
- **Q3**: Live agent-to-agent x402 micropayments and MCP tool calls
- **Q4**: Mainnet beta, audited contracts, persona marketplace, partner agents

## Security and compliance notes

- This is a prototype. Mock authentication is stored in `localStorage`. **Do not** use as-is for production.
- Restricted-jurisdiction screening is illustrative only.
- Wallet operations on `/wallet` are **real** on Casper Testnet/Mainnet — treat them accordingly. Agent attestations and x402 meters remain illustrative until Odra contracts land.
- Not financial, legal, or investment advice.
- Responsible-AI disclaimer: AI agent recommendations require human review.

## Hackathon / Buildathon submission notes

- Built for the **Casper Agentic Buildathon**.
- Demonstrates: MCP, x402, CSPR.click, CSPR.cloud, Odra, autonomous multi-agent workflows.
- Optimized for judge appeal: clear narrative, polished UI, interactive demos, full user journey.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Framework preset: **Other** (Vite). Build command: `bun run build`. Output dir: `.output/public` (TanStack Start default).
4. (Optional) Add the `VITE_CASPER_*` env vars listed in [Environment variables](#environment-variables) under **Settings → Environment Variables** (scope: Production, Preview, Development). None are required — public CSPR.cloud defaults ship in-repo — but set them to use a private RPC or to pre-seed contract hashes and x402 routing for every visitor.
5. Deploy.

> The project is also fully compatible with Cloudflare Pages / Workers deployments thanks to the TanStack Start edge target.

## License

MIT — for hackathon and demo purposes.

## Real Casper integration (Wallet Operations Console)

`/wallet` is wired to real Casper. Native transfers are built with `casper-js-sdk`, signed locally by your **Casper Wallet** browser extension, broadcast via `account_put_deploy`, and polled with `info_get_deploy` until `Executed → Finalized`.

**Setup**
1. Install the [Casper Wallet](https://www.casperwallet.io/) extension and create/import a key.
2. On Testnet, grab CSPR from the [faucet](https://testnet.cspr.live/tools/faucet).
3. Open `/wallet`, pick **Testnet** or **Mainnet** (segmented control, persisted to `localStorage`), and click **Connect Casper Wallet**.
4. Fill the recipient public key and amount, then **Sign & broadcast**.

**What ships in the transaction drawer**
- Live pipeline: `Signed → Broadcasting → Executed → Finalized` driven by real `info_get_deploy` polling.
- Timeouts, automatic retries, and clear error states with **Cancel** and **Retry** controls while polling.
- Full deploy receipt after finalization: block hash, gas cost (in CSPR), timestamp, and a one-click **Casper Explorer** link.
- Receipt export: **Copy raw**, **Export raw JSON**, and **Export decoded JSON** (adds network, explorer URL, gas in CSPR, and decoded fields).

**Network switch & contracts config**
- Segmented Testnet / Mainnet switch in the wallet header, persisted to `localStorage`.
- Dedicated **`/settings/contracts`** page to manage per-network Odra contract hashes and x402 routing (recipient public key + native-transfer amount). Env-defaulted, stored locally, with live inline validation:
  - 64-char hex contract hashes
  - Valid Casper public keys (must start with `01`/`02`)
  - Minimum 2.5 CSPR native payment
  - Save is disabled until the whole form is valid.

**Agent attestations (`/agents/*`)**
- Reusable `AttestationPanel` on Yieldra / Verus / Quorra / Sentinel.
- Attestations are broadcast today as x402 native-transfer deploys — the deploy hash is the on-chain receipt. When Odra entry points ship, these swap to real `mint_attestation` / `record_vote` / `route_deposit` calls with no UI change.
- Manual **Refresh attestations** action plus automatic re-polling on mount, on network switch, and after a new deploy. Each card shows an "Updated Xs ago" freshness indicator.

**Environment variables** (all optional — sensible public defaults ship in-repo, see `.env.example`)

| Var | Default | Purpose |
|---|---|---|
| `VITE_CASPER_TESTNET_RPC` | `https://node.testnet.cspr.cloud/rpc` | Testnet JSON-RPC endpoint |
| `VITE_CASPER_MAINNET_RPC` | `https://node.cspr.cloud/rpc` | Mainnet JSON-RPC endpoint |
| `VITE_CASPER_TESTNET_EXPLORER` | `https://testnet.cspr.live` | Testnet explorer base URL |
| `VITE_CASPER_MAINNET_EXPLORER` | `https://cspr.live` | Mainnet explorer base URL |
| `VITE_CASPER_*_CONTRACT_*` | — | Optional per-network Odra contract hash defaults (see `.env.example`) |
| `VITE_CASPER_*_X402_RECIPIENT` / `_AMOUNT` | — | Optional x402 routing defaults per network |

**Still simulated** (called out in the UI):
- Odra contract entry points for agent attestations — deploys today settle as x402 native transfers pending Testnet contract deployment.
- x402 upstream metering — needs Lovable Cloud + agent-key backend to price and settle third-party MCP calls server-side.
- Legacy transaction rows in `/wallet` history — labeled *demo data*.


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

None required for the prototype. All data is mocked locally.

## Demo script for judges

1. Land on `/` — read tagline, problem, solution, meet the crew, why Casper.
2. Click **Pick your persona** → choose, e.g., DeFi Investor.
3. Complete signup (18+, country, terms, compliance).
4. Land on `/dashboard` — point out persona-tailored card, agent crew, x402 spend, on-chain actions, alerts, system health.
5. Open `/agents/yield` — change risk tolerance, watch decision trace and prepared CSPR.click signing payload.
6. Open `/agents/rwa` — show 5-source oracle, attestation JSON.
7. Open `/agents/dao` — show 4-agent debate and cast a vote.
8. Open `/agents/compliance` — walk through ZK KYC flow end to end.
9. Open `/architecture` and `/docs` to show the toolkit alignment.
10. Logout from the header.

## Screenshots

Run the app locally and capture:
- `/` hero
- `/dashboard`
- each `/agents/*` workflow
- `/architecture`

Place them under `docs/screenshots/` (folder is created on first commit).

## Roadmap

- **Q1**: Prototype (this repo)
- **Q2**: Wire real CSPR.click signing, CSPR.cloud reads, first Odra contract on testnet
- **Q3**: Live agent-to-agent x402 micropayments and MCP tool calls
- **Q4**: Mainnet beta, audited contracts, persona marketplace, partner agents

## Security and compliance notes

- This is a prototype. Mock authentication is stored in `localStorage`. **Do not** use as-is for production.
- Restricted-jurisdiction screening is illustrative only.
- All on-chain interactions shown are mocked — no real funds move.
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
4. No environment variables required.
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

**Environment variables** (all optional — sensible public defaults ship in-repo, see `.env.example`)

| Var | Default | Purpose |
|---|---|---|
| `VITE_CASPER_TESTNET_RPC` | `https://node.testnet.cspr.cloud/rpc` | Testnet JSON-RPC endpoint |
| `VITE_CASPER_MAINNET_RPC` | `https://node.cspr.cloud/rpc` | Mainnet JSON-RPC endpoint |
| `VITE_CASPER_TESTNET_EXPLORER` | `https://testnet.cspr.live` | Testnet explorer base URL |
| `VITE_CASPER_MAINNET_EXPLORER` | `https://cspr.live` | Mainnet explorer base URL |

**Still simulated** (called out in the UI):
- Agent attestation JSON on `/agents/*` — needs Odra contracts deployed to Testnet.
- x402 micropayment metering — needs Lovable Cloud + agent-key backend.
- Legacy transaction rows in `/wallet` history — labeled *demo data*.

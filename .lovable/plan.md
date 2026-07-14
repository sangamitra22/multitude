## Goal

Replace the mocked wallet console with a real Casper integration: CSPR.click for connect/sign, Casper JSON-RPC (CSPR.cloud) for broadcast + status polling, and a Testnet/Mainnet network switch driven by env vars. Keep the rest of the app (agents, personas, dashboard, pitch narrative) unchanged — agent attestations remain illustrative until Odra contracts are deployed.

## Scope

**In scope (this turn)**
1. CSPR.click connect / disconnect / sign in `/wallet`.
2. Casper JSON-RPC transfer deploy: build → sign → `account_put_deploy` → poll `info_get_deploy` until `Signed → Broadcasting → Executed → Finalized`.
3. Network switch (Testnet ↔ Mainnet) in the header of `/wallet`, persisted to `localStorage`, defaulting to Testnet.
4. Env-var driven endpoints (`VITE_CASPER_TESTNET_RPC`, `VITE_CASPER_MAINNET_RPC`, optional `VITE_CASPER_TESTNET_EXPLORER`, `VITE_CASPER_MAINNET_EXPLORER`) with sensible public defaults so it works out of the box.
5. Real deploy hash + explorer link surfaced in the transaction drawer; live status timeline replaces the `setTimeout` fake.
6. Keep the existing mock `TXS` history rows for demo continuity, but any new signed deploy is a real one and merged into the list.

**Explicitly out of scope (called out in UI as "Coming next")**
- Odra contract calls for agent attestations (needs deployed contracts + entry points).
- Backend agent keys / x402 orchestration (needs Lovable Cloud + secrets).
- Non-transfer deploy types.

## Technical design

### Packages
Add via `bun add`:
- `@make-software/csprclick-core-client`, `@make-software/csprclick-ui`, `@make-software/csprclick-core-types` — official CSPR.click SDK.
- `casper-js-sdk` — build deploys, sign payload assembly, RPC client.

### Files

**`src/lib/casper/network.ts`** — network registry.
```ts
export type NetworkId = "casper-test" | "casper";
export const NETWORKS = {
  "casper-test": {
    id: "casper-test", label: "Testnet",
    rpc: import.meta.env.VITE_CASPER_TESTNET_RPC ?? "https://node.testnet.cspr.cloud/rpc",
    explorer: import.meta.env.VITE_CASPER_TESTNET_EXPLORER ?? "https://testnet.cspr.live",
  },
  "casper": {
    id: "casper", label: "Mainnet",
    rpc: import.meta.env.VITE_CASPER_MAINNET_RPC ?? "https://node.cspr.cloud/rpc",
    explorer: import.meta.env.VITE_CASPER_MAINNET_EXPLORER ?? "https://cspr.live",
  },
} as const;
```

**`src/lib/casper/CasperClickProvider.tsx`** — client-only provider that initializes `ClickClient` with `contractPackageHash`s for both networks and exposes `useCasperClick()` returning `{ client, activeAccount, connect, disconnect, signDeploy, network, setNetwork }`. Wrapped in `<ClientOnly>` from `@tanstack/react-router` inside `__root.tsx` so SSR never touches `window`. Persists `network` in `localStorage` under `multitude:network`.

**`src/lib/casper/rpc.ts`** — thin JSON-RPC helpers using `casper-js-sdk`'s `CasperServiceByJsonRPC`:
- `putDeploy(network, signedDeploy)` → deploy hash.
- `pollDeploy(network, hash, onUpdate)` → walks `Signed → Broadcasting → Executed → Finalized` by calling `info_get_deploy` every 3s (max 90s), reporting execution results and block hash.

**`src/lib/casper/buildTransfer.ts`** — builds an unsigned `Deploy` (native transfer) from `{ from, to, amountMotes, memo, network }`, ready for CSPR.click to sign.

**`src/routes/wallet.tsx`** — refactor:
- Replace mock connect button with CSPR.click connect (opens their modal).
- Show live account hash + balance fetched from RPC (`state_get_balance`).
- Network selector (Testnet / Mainnet) in the top card; changing it disconnects + reconnects.
- Sign form: converts CSPR → motes, calls `buildTransfer` → `signDeploy` → `putDeploy` → starts polling.
- New signed rows carry real hash, explorer URL, and live status; `TxDetailsDrawer` pipeline steps derive from poll updates (Signed on sign, Broadcasting after `put_deploy`, Executed on first `execution_results` with success, Finalized once block is finalized; failure path shown in red).

**`src/routes/__root.tsx`** — wrap children in `<CasperClickProvider>` inside a `<ClientOnly>` boundary.

**`.env.example`** — document the four `VITE_CASPER_*` vars; explain public defaults and how to swap in a private CSPR.cloud endpoint.

**`README.md`** — short "Real Casper integration" section listing env vars, network switch, and what's still mocked (agent attestations, x402).

### SSR / execution model

- CSPR.click, `casper-js-sdk` deploy building, and any `window.csprclick` access run client-only. Provider is imported through `React.lazy` behind `<ClientOnly>`; RPC helpers stay isomorphic (pure `fetch`) but are only invoked from event handlers / `useEffect`.
- No secrets in the client — RPC URLs are public; `VITE_` prefix is intentional.

### UX for the network switch

Small segmented control (Testnet | Mainnet) in the wallet header. Switching:
1. Confirms if a wallet is connected.
2. Calls `disconnect()`, updates `localStorage`, reinitializes `ClickClient` with the new `chainName`.
3. Clears the in-memory signed list (previous hashes belong to the other network); mock demo rows stay.

### What stays mocked, clearly labeled

- Agent attestation JSON on `/agents/*` pages — badge "Illustrative (Odra contracts not deployed yet)".
- Historical `TXS` rows in wallet — badge "Demo data".
- x402 amounts everywhere — badge "Simulated meter".

## Deliverables

- Real Casper Testnet transfers signed by the user's CSPR.click wallet and confirmed on-chain, with live status.
- Persistent Testnet/Mainnet switch driven by env vars.
- Docs (`.env.example`, README section) explaining setup.
- Clear in-UI labeling of what is real vs. still illustrative.

## Follow-ups (next turns, not this one)

1. Deploy Odra attestation contracts to Testnet; wire Verus / Sentinel / Quorra to real entry points.
2. Enable Lovable Cloud and move agent keys + x402 orchestration server-side.
3. Add deploy cost estimation + gas preview before sign.

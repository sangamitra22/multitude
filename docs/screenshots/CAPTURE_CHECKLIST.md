# Screenshot capture checklist

Deterministic recipe for producing the images referenced by the top-level `README.md`. Every image lives in `docs/screenshots/` and is checked into the repo.

> Setup: run `bun run dev`, open the app at http://localhost:8080, install the [Casper Wallet](https://www.casperwallet.io/) extension, fund the active key from the [Testnet faucet](https://testnet.cspr.live/tools/faucet), and set the browser viewport to **1440 × 900**. Use system dark mode.

## Required images

### 1. `wallet-receipt-exports.png` — Finalized deploy receipt with export buttons
**Route:** `/wallet` on **Testnet** with the transaction drawer open on a `Finalized` deploy.

1. Connect Casper Wallet.
2. Sign & broadcast a native transfer of `2.5` CSPR to any valid public key (or click **Broadcast x402**).
3. Wait until the row shows the `finalized` badge, then click the row to open the drawer.
4. Scroll the drawer until the **Deploy receipt · Finalized** panel is fully visible.
5. Capture the drawer only (right side sheet) — full panel including:
   - Deploy hash, block hash, gas cost, timestamp fields
   - The four action buttons: **Download receipt JSON**, **Export raw JSON**, **Export decoded JSON**, **Copy raw**
   - The "Verify on Testnet explorer →" link at the top
6. Save as `docs/screenshots/wallet-receipt-exports.png` (PNG, ~1200 px wide).

### 2. `settings-contracts-validation.png` — Inline validation errors on `/settings/contracts`
**Route:** `/settings/contracts` on either network tab.

Populate these values to trigger every validator at once:

| Field | Value | Triggered error |
|---|---|---|
| Verus (RWA Oracle) contract hash | `xyz-not-hex-1234` | non-hex chars |
| Sentinel (Compliance) contract hash | `deadbeef` (8 chars) | length ≠ 64 |
| Quorra (DAO) contract hash | *(paste a valid 64-char hash, then paste the same hash into Yieldra)* | duplicate detection on the second field |
| x402 recipient public key | `03abcd…` (starts with `03`) | prefix must be 01/02 |
| x402 payment motes | `100000000` (0.1 CSPR) | below 2.5 CSPR minimum |

1. Tab out of each field so the `touched` state fires and the red borders + error messages render.
2. Confirm the **Save** button at the bottom is disabled and shows "Fix highlighted fields to enable Save."
3. Capture the full page from the header down to and including the disabled Save row.
4. Save as `docs/screenshots/settings-contracts-validation.png`.

## Optional extras (nice-to-have, not referenced by README)

Capture these at the same 1440 × 900 viewport for the pitch deck / marketing:

- `home-hero.png` — `/` scrolled to top with the hero + brand mark.
- `dashboard-<persona>.png` — one per persona (`defi-investor`, `rwa-operator`, `dao-manager`, `compliance-officer`, `developer`).
- `agents-<agent>.png` — `/agents/yield`, `/agents/rwa`, `/agents/dao`, `/agents/compliance` with attestation panel visible.
- `demo-mode.png` — `/demo` mid-walkthrough with step 3 in the active state.
- `preflight-error.png` — set `VITE_CASPER_TESTNET_RPC=not-a-url` in `.env`, restart dev, capture the blocking preflight screen.
- `architecture.png` — `/architecture` full flow diagram.

## Post-capture

- Compress PNGs with `oxipng` or `pngquant` before committing (target < 400 KB each).
- Do not commit screenshots that include real wallet keys with funds or personal identifiers — Testnet keys are fine.
- If a screenshot's referenced UI changes, retake it in the same session so the README and images stay consistent.

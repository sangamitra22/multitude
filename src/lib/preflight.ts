import { NETWORKS, type NetworkId } from "./casper/network";
import { getContractsConfig } from "./casper/config";
import { validateContractHash, validateMotes, validatePublicKey } from "./casper/validation";

export type PreflightSeverity = "error" | "warning";

export interface PreflightIssue {
  severity: PreflightSeverity;
  scope: string; // "env" | "casper-test" | "casper" | ...
  field: string;
  message: string;
  fix?: string;
}

export interface PreflightResult {
  ok: boolean;         // no errors
  clean: boolean;      // no errors AND no warnings
  issues: PreflightIssue[];
  checkedAt: string;
}

function isHttpsUrl(v: string | undefined): boolean {
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function runPreflight(): PreflightResult {
  const issues: PreflightIssue[] = [];

  (Object.keys(NETWORKS) as NetworkId[]).forEach((id) => {
    const net = NETWORKS[id];

    if (!isHttpsUrl(net.rpc)) {
      issues.push({
        severity: "error",
        scope: id,
        field: id === "casper-test" ? "VITE_CASPER_TESTNET_RPC" : "VITE_CASPER_MAINNET_RPC",
        message: `Invalid RPC URL for ${net.label}: ${net.rpc || "(empty)"}`,
        fix: "Set a valid https:// JSON-RPC endpoint in the environment.",
      });
    }
    if (!isHttpsUrl(net.explorer)) {
      issues.push({
        severity: "error",
        scope: id,
        field: id === "casper-test" ? "VITE_CASPER_TESTNET_EXPLORER" : "VITE_CASPER_MAINNET_EXPLORER",
        message: `Invalid explorer URL for ${net.label}: ${net.explorer || "(empty)"}`,
        fix: "Set a valid https:// explorer base URL.",
      });
    }

    const cfg = getContractsConfig(id);

    // Contract hashes: optional, but if set must be well-formed.
    (Object.keys(cfg.agents) as (keyof typeof cfg.agents)[]).forEach((k) => {
      const err = validateContractHash(cfg.agents[k]);
      if (err) {
        issues.push({
          severity: "error",
          scope: id,
          field: `contract:${String(k)}`,
          message: `${net.label} · ${String(k)} contract hash — ${err}`,
          fix: "Open /settings/contracts to fix or clear the value.",
        });
      }
    });

    // x402 recipient: optional but if set must be a valid public key.
    const recErr = validatePublicKey(cfg.x402.recipientPublicKeyHex, { required: false });
    if (recErr) {
      issues.push({
        severity: "error",
        scope: id,
        field: "x402:recipient",
        message: `${net.label} · x402 recipient — ${recErr}`,
        fix: "Open /settings/contracts to fix or clear the value.",
      });
    } else if (!cfg.x402.recipientPublicKeyHex) {
      issues.push({
        severity: "warning",
        scope: id,
        field: "x402:recipient",
        message: `${net.label} has no x402 recipient configured.`,
        fix: "Wallet still works; set a recipient in /settings/contracts to broadcast x402 micropayments.",
      });
    }

    const motesErr = validateMotes(cfg.x402.paymentMotes);
    if (motesErr) {
      issues.push({
        severity: "error",
        scope: id,
        field: "x402:motes",
        message: `${net.label} · x402 payment motes — ${motesErr}`,
        fix: "Set VITE_CASPER_*_X402_MOTES ≥ 2500000000 or update /settings/contracts.",
      });
    }
  });

  const errors = issues.filter((i) => i.severity === "error");
  return {
    ok: errors.length === 0,
    clean: issues.length === 0,
    issues,
    checkedAt: new Date().toISOString(),
  };
}

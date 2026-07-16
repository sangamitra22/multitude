import type { NetworkId } from "./network";
import type { ContractsConfig, AgentKey } from "./config";

const HEX = /^[0-9a-fA-F]+$/;

export function validateContractHash(v: string | undefined): string | null {
  if (!v) return null; // optional
  const s = v.trim();
  if (s.startsWith("hash-") || s.startsWith("contract-")) {
    return "Enter the raw hex hash only — omit the 'hash-' / 'contract-' prefix.";
  }
  if (!HEX.test(s)) return "Contract hash must be hexadecimal (0-9, a-f).";
  if (s.length !== 64) return `Contract hash must be exactly 64 hex chars (got ${s.length}).`;
  return null;
}

// Casper public keys: 66 hex (ed25519, prefix 01) or 68 hex (secp256k1, prefix 02)
export function validatePublicKey(v: string | undefined, opts: { required?: boolean; networkId?: NetworkId } = {}): string | null {
  if (!v) return opts.required ? "Recipient public key is required to route x402 payments." : null;
  const s = v.trim();
  if (!HEX.test(s)) return "Public key must be hexadecimal.";
  const prefix = s.slice(0, 2).toLowerCase();
  if (prefix === "01") {
    if (s.length !== 66) return `ed25519 public keys are 66 hex chars (got ${s.length}).`;
  } else if (prefix === "02") {
    if (s.length !== 68) return `secp256k1 public keys are 68 hex chars (got ${s.length}).`;
  } else {
    return "Public key must start with 01 (ed25519) or 02 (secp256k1).";
  }
  // Simple network-mismatch heuristic: warn if user pasted a testnet-looking key on mainnet or vice-versa
  // (no strict on-chain check possible client-side; leave to runtime).
  return null;
}

const MIN_TRANSFER_MOTES = 2_500_000_000n;

export function validateMotes(v: string | undefined): string | null {
  if (!v) return "Payment amount is required.";
  const s = v.trim();
  if (!/^\d+$/.test(s)) return "Amount must be a whole number of motes (no decimals).";
  let n: bigint;
  try { n = BigInt(s); } catch { return "Invalid amount."; }
  if (n <= 0n) return "Amount must be greater than 0.";
  if (n < MIN_TRANSFER_MOTES) return `Native Casper transfers require at least 2.5 CSPR (2,500,000,000 motes).`;
  return null;
}

export interface ContractsErrors {
  agents: Partial<Record<AgentKey, string>>;
  x402: { recipientPublicKeyHex?: string; paymentMotes?: string };
  agentDuplicates?: string;
}

export function validateContractsConfig(cfg: ContractsConfig, networkId: NetworkId): ContractsErrors {
  const errors: ContractsErrors = { agents: {}, x402: {} };
  const seen = new Map<string, AgentKey>();
  (Object.keys(cfg.agents) as AgentKey[]).forEach((k) => {
    const v = cfg.agents[k];
    const err = validateContractHash(v);
    if (err) errors.agents[k] = err;
    else if (v) {
      const norm = v.trim().toLowerCase();
      const prior = seen.get(norm);
      if (prior && prior !== k) {
        errors.agents[k] = `Duplicate of ${prior}. Each agent needs a distinct contract hash.`;
      } else {
        seen.set(norm, k);
      }
    }
  });
  errors.x402.recipientPublicKeyHex = validatePublicKey(cfg.x402.recipientPublicKeyHex, { required: false, networkId }) ?? undefined;
  errors.x402.paymentMotes = validateMotes(cfg.x402.paymentMotes) ?? undefined;
  return errors;
}

export function hasErrors(e: ContractsErrors): boolean {
  return Object.values(e.agents).some(Boolean) || !!e.x402.recipientPublicKeyHex || !!e.x402.paymentMotes;
}

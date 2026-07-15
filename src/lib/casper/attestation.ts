import { getContractsConfig, type AgentKey } from "./config";
import type { NetworkId } from "./network";

// Attestation log: each successful agent x402 payment is recorded locally
// against the configured contract for that network+agent. This is the honest
// bridge until Odra attestation contracts are deployed — the x402 payment
// deploy itself IS broadcast to Casper, and its deploy hash serves as the
// on-chain receipt for the attestation event.

export interface AttestationRecord {
  id: string;
  networkId: NetworkId;
  agent: AgentKey;
  deployHash: string;
  amountCspr: string;
  memo: string;
  timestamp: string;
  contractHash?: string; // captured at write time
  blockHash?: string;
  status: "pending" | "finalized" | "failed";
  errorMessage?: string;
}

const STORAGE_KEY = "multitude:attestations";
const EVT = "multitude:attestations-changed";

function readAll(): AttestationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AttestationRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: AttestationRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, 100)));
  window.dispatchEvent(new Event(EVT));
}

export function listAttestations(networkId: NetworkId, agent: AgentKey): AttestationRecord[] {
  return readAll().filter((r) => r.networkId === networkId && r.agent === agent);
}

export function recordAttestation(r: AttestationRecord) {
  writeAll([r, ...readAll()]);
}

export function updateAttestation(id: string, patch: Partial<AttestationRecord>) {
  writeAll(readAll().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export function subscribeAttestations(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVT, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(EVT, fn);
    window.removeEventListener("storage", fn);
  };
}

export function agentContractHash(networkId: NetworkId, agent: AgentKey): string | undefined {
  const cfg = getContractsConfig(networkId);
  return cfg.agents[agent];
}

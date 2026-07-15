import type { NetworkId } from "./network";

// Per-network contract + x402 configuration. Env defaults, overridable at
// runtime from /settings/contracts (persisted in localStorage).

export interface AgentContracts {
  verus?: string;       // Odra contract hash (hex, 64 chars) or contract package hash
  sentinel?: string;
  quorra?: string;
  yieldRouter?: string;
}

export interface X402Config {
  recipientPublicKeyHex?: string; // where micropayments settle
  paymentMotes: string;           // motes per x402 call (default 42_000_000 = 0.042 CSPR)
}

export interface ContractsConfig {
  agents: AgentContracts;
  x402: X402Config;
}

const STORAGE_KEY = "multitude:contracts";
const env = import.meta.env as Record<string, string | undefined>;

function envDefaults(net: NetworkId): ContractsConfig {
  const p = net === "casper" ? "MAINNET" : "TESTNET";
  return {
    agents: {
      verus: env[`VITE_CASPER_${p}_VERUS_CONTRACT`],
      sentinel: env[`VITE_CASPER_${p}_SENTINEL_CONTRACT`],
      quorra: env[`VITE_CASPER_${p}_QUORRA_CONTRACT`],
      yieldRouter: env[`VITE_CASPER_${p}_YIELD_CONTRACT`],
    },
    x402: {
      recipientPublicKeyHex: env[`VITE_CASPER_${p}_X402_RECIPIENT`],
      paymentMotes: env[`VITE_CASPER_${p}_X402_MOTES`] ?? "42000000",
    },
  };
}

type Overrides = Partial<Record<NetworkId, Partial<ContractsConfig>>>;

function readOverrides(): Overrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function writeOverrides(o: Overrides) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  window.dispatchEvent(new Event("multitude:contracts-changed"));
}

export function getContractsConfig(net: NetworkId): ContractsConfig {
  const base = envDefaults(net);
  const override = readOverrides()[net];
  if (!override) return base;
  return {
    agents: { ...base.agents, ...(override.agents ?? {}) },
    x402: { ...base.x402, ...(override.x402 ?? {}) },
  };
}

export function saveContractsConfig(net: NetworkId, cfg: ContractsConfig) {
  const all = readOverrides();
  all[net] = cfg;
  writeOverrides(all);
}

export function resetContractsConfig(net: NetworkId) {
  const all = readOverrides();
  delete all[net];
  writeOverrides(all);
}

export type AgentKey = keyof AgentContracts;
export const AGENT_LABELS: Record<AgentKey, string> = {
  verus: "Verus (RWA Oracle)",
  sentinel: "Sentinel (Compliance)",
  quorra: "Quorra (DAO)",
  yieldRouter: "Yieldra (Yield Router)",
};

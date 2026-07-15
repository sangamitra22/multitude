import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCasperWallet } from "@/lib/casper/wallet";
import { NETWORKS, type NetworkId } from "@/lib/casper/network";
import {
  AGENT_LABELS,
  getContractsConfig,
  resetContractsConfig,
  saveContractsConfig,
  type AgentKey,
  type ContractsConfig,
} from "@/lib/casper/config";

export const Route = createFileRoute("/settings/contracts")({
  head: () => ({
    meta: [
      { title: "Contracts & Config — Multitude" },
      { name: "description", content: "Manage Casper contract hashes and x402 payment settings per network." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsContracts,
});

function SettingsContracts() {
  const { network, setNetwork } = useCasperWallet();
  const [tab, setTab] = useState<NetworkId>(network.id);
  const [cfg, setCfg] = useState<ContractsConfig>(() => getContractsConfig(network.id));
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => setCfg(getContractsConfig(tab)), [tab]);

  const patchAgent = (k: AgentKey, v: string) =>
    setCfg((c) => ({ ...c, agents: { ...c.agents, [k]: v || undefined } }));
  const patchX402 = (k: "recipientPublicKeyHex" | "paymentMotes", v: string) =>
    setCfg((c) => ({ ...c, x402: { ...c.x402, [k]: v || (k === "paymentMotes" ? "42000000" : undefined) } as ContractsConfig["x402"] }));

  function save() {
    saveContractsConfig(tab, cfg);
    setSaved("Saved locally. Reads/writes on " + NETWORKS[tab].label + " now use these values.");
    setTimeout(() => setSaved(null), 3500);
  }
  function reset() {
    resetContractsConfig(tab);
    setCfg(getContractsConfig(tab));
    setSaved("Reset to env defaults.");
    setTimeout(() => setSaved(null), 3500);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Contracts &amp; Config</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set per-network Odra contract hashes and x402 micropayment routing. Values come from env vars by default and are overridable here (stored in your browser).
          </p>
        </div>
        <div className="inline-flex glass-card p-1 rounded-lg text-sm">
          {(Object.keys(NETWORKS) as NetworkId[]).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-1.5 rounded-md transition ${tab === id ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary/60 text-muted-foreground"}`}
            >
              {NETWORKS[id].label}
            </button>
          ))}
        </div>
      </header>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-bold">Agent contract hashes ({NETWORKS[tab].label})</h2>
        <p className="text-xs text-muted-foreground">
          Paste the deployed Odra contract hash (or contract-package hash) for each agent. Agents fall back to x402 micropayments while a contract is unset — attestation writes are the payment deploy itself.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {(Object.keys(AGENT_LABELS) as AgentKey[]).map((k) => (
            <label key={k} className="block">
              <span className="block text-xs text-muted-foreground mb-1">{AGENT_LABELS[k]}</span>
              <input
                value={cfg.agents[k] ?? ""}
                onChange={(e) => patchAgent(k, e.target.value.trim())}
                placeholder="e.g. 8f3a…9c2b (hex-64) or leave empty"
                className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm font-mono"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-bold">x402 micropayment routing ({NETWORKS[tab].label})</h2>
        <p className="text-xs text-muted-foreground">
          Every agent action that would consume an off-chain resource is settled with a small CSPR transfer to this recipient. The transfer id encodes the call. Recipient must be a valid public key hex on {NETWORKS[tab].label}.
        </p>
        <div className="grid md:grid-cols-[2fr_1fr] gap-4">
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">Recipient public key (hex)</span>
            <input
              value={cfg.x402.recipientPublicKeyHex ?? ""}
              onChange={(e) => patchX402("recipientPublicKeyHex", e.target.value.trim())}
              placeholder="0202…"
              className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm font-mono"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">Payment per call (motes)</span>
            <input
              value={cfg.x402.paymentMotes}
              onChange={(e) => patchX402("paymentMotes", e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm font-mono"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatCspr(cfg.x402.paymentMotes)} CSPR per call · minimum native transfer on Casper is 2.5 CSPR.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save} className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90">
          Save {NETWORKS[tab].label} config
        </button>
        <button onClick={reset} className="px-5 py-2.5 rounded-md border border-border hover:bg-secondary">
          Reset to env defaults
        </button>
        <button onClick={() => setNetwork(tab)} className="px-5 py-2.5 rounded-md border border-border hover:bg-secondary">
          Switch wallet to {NETWORKS[tab].label}
        </button>
        {saved && <span className="text-xs text-success">{saved}</span>}
      </div>

      <div className="glass-card p-6 text-xs text-muted-foreground">
        <div className="font-semibold text-foreground mb-2">Env variables read at build time</div>
        <pre className="bg-input p-4 rounded-md overflow-x-auto text-[11px] leading-relaxed">
{`VITE_CASPER_TESTNET_RPC / VITE_CASPER_MAINNET_RPC
VITE_CASPER_TESTNET_EXPLORER / VITE_CASPER_MAINNET_EXPLORER
VITE_CASPER_TESTNET_VERUS_CONTRACT   VITE_CASPER_MAINNET_VERUS_CONTRACT
VITE_CASPER_TESTNET_SENTINEL_CONTRACT VITE_CASPER_MAINNET_SENTINEL_CONTRACT
VITE_CASPER_TESTNET_QUORRA_CONTRACT   VITE_CASPER_MAINNET_QUORRA_CONTRACT
VITE_CASPER_TESTNET_YIELD_CONTRACT    VITE_CASPER_MAINNET_YIELD_CONTRACT
VITE_CASPER_TESTNET_X402_RECIPIENT    VITE_CASPER_MAINNET_X402_RECIPIENT
VITE_CASPER_TESTNET_X402_MOTES        VITE_CASPER_MAINNET_X402_MOTES`}
        </pre>
      </div>
    </div>
  );
}

function formatCspr(motes: string) {
  try {
    return (Number(BigInt(motes)) / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 4 });
  } catch {
    return "—";
  }
}

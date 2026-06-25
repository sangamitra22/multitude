import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — CasperCrew" },
      { name: "description", content: "How CasperCrew connects users, AI agents, MCP servers, CSPR.cloud, x402, Odra contracts and the Casper blockchain." },
      { property: "og:title", content: "Architecture — CasperCrew" },
      { property: "og:url", content: "/architecture" },
    ],
    links: [{ rel: "canonical", href: "/architecture" }],
  }),
  component: Architecture,
});

const LAYERS = [
  { t: "User", d: "Picks a persona, signs in, gives intents." },
  { t: "CasperCrew UI", d: "React + TanStack Start. Dashboard, workflows, audit trails." },
  { t: "AI Agent Orchestrator", d: "Routes user intents to specialized agents; plans tool calls." },
  { t: "MCP Servers", d: "Casper-aware tools: balance, price, defi, governance, contract intros." },
  { t: "CSPR.cloud APIs", d: "Scalable read/write infrastructure for the agent fleet." },
  { t: "x402 Micropayments", d: "Pay-per-call settlement between agents and API providers." },
  { t: "Odra Smart Contracts", d: "Upgradable Rust-based contracts for routing, attestations, KYC." },
  { t: "Casper Blockchain", d: "Trust, identity, auditability, final settlement." },
  { t: "Monitoring & Audit", d: "Every action emits an on-chain event + off-chain trace." },
];

function Architecture() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      <header>
        <h1 className="text-4xl font-bold mb-2">Architecture</h1>
        <p className="text-muted-foreground max-w-2xl">A clean, layered design that maps directly to the Casper AI Toolkit — every primitive has a place.</p>
      </header>

      {/* Vertical flow */}
      <div className="glass-card p-6">
        <div className="grid gap-3">
          {LAYERS.map((l, i) => (
            <div key={l.t} className="grid grid-cols-[auto_1fr] gap-4 items-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary grid place-items-center text-primary font-bold">{i + 1}</div>
                {i < LAYERS.length - 1 && <div className="w-px h-8 bg-border" />}
              </div>
              <div className="glass-card p-4">
                <div className="font-bold">{l.t}</div>
                <div className="text-sm text-muted-foreground">{l.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          ["MCP", "Agents query Casper through standardized MCP tool calls — e.g. balance, defi-list, governance-list."],
          ["x402", "Agents budget and settle micropayments per request, billed to a Casper account."],
          ["CSPR.click", "Wallet creation, transaction signing, and CSPR.cloud API access — all from one skill."],
          ["CSPR.cloud", "High-throughput indexed reads + bulk submits behind a managed API."],
          ["Odra", "Rust-based smart-contract framework that the Builder agent (Forge) targets when generating new contracts."],
          ["Casper L1", "Provides predictable fees, identity, and a tamper-proof audit log for every agent action."],
        ].map(([t, d]) => (
          <div key={t} className="glass-card p-5">
            <div className="font-bold">{t}</div>
            <div className="text-sm text-muted-foreground mt-1">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

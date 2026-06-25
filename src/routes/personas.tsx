import { createFileRoute, Link } from "@tanstack/react-router";
import { PERSONA_LABELS, type Persona } from "@/lib/auth";

export const Route = createFileRoute("/personas")({
  head: () => ({
    meta: [
      { title: "Personas — CasperCrew" },
      { name: "description", content: "Pick your CasperCrew persona — DeFi investor, RWA operator, DAO manager, compliance officer, or developer." },
      { property: "og:title", content: "Personas — CasperCrew" },
      { property: "og:description", content: "Tailor your CasperCrew experience to your role." },
      { property: "og:url", content: "/personas" },
    ],
    links: [{ rel: "canonical", href: "/personas" }],
  }),
  component: Personas,
});

const PERSONAS: { id: Persona; emoji: string; tagline: string; bullets: string[] }[] = [
  { id: "defi-investor", emoji: "📈", tagline: "Autonomous yield routing & portfolio optimization.", bullets: ["Risk-aware APY hunting", "Auto-rebalancing", "Slippage & MEV guards"] },
  { id: "rwa-operator", emoji: "🏗️", tagline: "Verified off-chain data, anchored on-chain.", bullets: ["Multi-source oracles", "Provenance receipts", "Reputation scoring"] },
  { id: "dao-manager", emoji: "🏛️", tagline: "Multi-agent governance review & execution.", bullets: ["Proposal triage", "Risk + treasury review", "Auto-execution"] },
  { id: "compliance-officer", emoji: "🛂", tagline: "AI-assisted KYC/AML & risk monitoring.", bullets: ["ZK attestations", "Sanctions screening", "Revoke lifecycle"] },
  { id: "developer", emoji: "🧑‍💻", tagline: "Build on MCP, x402, CSPR.cloud, Odra.", bullets: ["SDK examples", "Live MCP playground", "Contract scaffolding"] },
];

function Personas() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-3">Pick your persona</h1>
      <p className="text-muted-foreground mb-10">CasperCrew tailors agents, workflows and dashboard cards to your role.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PERSONAS.map((p) => (
          <Link key={p.id} to="/signup" search={{ persona: p.id }} className="glass-card p-6 hover:glow-border transition group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition">{p.emoji}</div>
            <div className="font-bold text-lg">{PERSONA_LABELS[p.id]}</div>
            <div className="text-sm text-primary mb-3">{p.tagline}</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {p.bullets.map((b) => <li key={b}>• {b}</li>)}
            </ul>
            <div className="mt-4 text-sm text-primary">Choose →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

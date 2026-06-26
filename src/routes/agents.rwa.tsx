import { createFileRoute } from "@tanstack/react-router";
import { AgentGate } from "@/lib/personaAgents";


export const Route = createFileRoute("/agents/rwa")({
  head: () => ({
    meta: [
      { title: "Verus — RWA Oracle | CasperCrew" },
      { name: "description", content: "Verus ingests off-chain data, scores its risk and posts verified attestations on Casper with provenance." },
      { property: "og:title", content: "Verus — RWA Oracle" },
      { property: "og:url", content: "/agents/rwa" },
    ],
    links: [{ rel: "canonical", href: "/agents/rwa" }],
  }),
  component: () => <AgentGate agent="rwa"><RWA /></AgentGate>,
});

function RWA() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header>
        <div className="text-xs text-primary font-mono mb-2">AGENT · VERUS 🛡️</div>
        <h1 className="text-4xl font-bold mb-2">RWA oracle with verifiable identity</h1>
        <p className="text-muted-foreground">Verus brings off-chain reality on-chain — with cryptographic provenance and a reputation score.</p>
      </header>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          ["Sources active", "5", "Bloomberg, Reuters, IEX, ICE, Fed"],
          ["Reputation", "96 / 100", "+0.4 this week"],
          ["Attestations / day", "418", "avg 320ms"],
          ["Disputes", "0", "30-day window"],
        ].map(([t, v, s]) => (
          <div key={t} className="glass-card p-5"><div className="text-xs text-muted-foreground">{t}</div><div className="text-2xl font-bold mt-1">{v}</div><div className="text-xs text-primary">{s}</div></div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="font-bold mb-4">Verification pipeline</h2>
        <div className="grid md:grid-cols-5 gap-3 text-sm">
          {[
            ["1. Ingest", "Pull from N sources via x402-paid feeds"],
            ["2. Reconcile", "Median + outlier rejection"],
            ["3. Risk score", "AI deviation + source-trust model"],
            ["4. Sign", "CSPR.click attestation key"],
            ["5. Post", "Odra contract → Casper on-chain"],
          ].map(([t, d]) => (
            <div key={t} className="p-4 rounded-lg bg-secondary/40"><div className="font-semibold">{t}</div><div className="text-xs text-muted-foreground mt-1">{d}</div></div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold mb-3">Latest feed: Brent crude</h3>
          <div className="text-3xl font-bold font-mono">$84.21</div>
          <div className="text-xs text-muted-foreground">Median of 5 sources · σ 0.04 · confidence 99.2%</div>
          <div className="mt-4 grid grid-cols-5 gap-1 h-20 items-end">
            {[40, 65, 55, 80, 92].map((h, i) => <div key={i} className="bg-primary/60 rounded-t" style={{ height: `${h}%` }} />)}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-bold mb-3">On-chain attestation (mock)</h3>
          <pre className="text-xs bg-input p-4 rounded-md overflow-x-auto">
{`{
  "feed": "brent_crude_usd",
  "value": 84.21,
  "ts": "2026-06-25T10:14:22Z",
  "sources": ["bloomberg","reuters","ice","iex","fed"],
  "signer": "verus.cspr",
  "tx": "0x71be…aa02",
  "x402_paid": "0.012 CSPR"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

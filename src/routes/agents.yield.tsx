import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { YIELD_OPPS } from "@/lib/mockData";
import { AgentGate } from "@/lib/personaAgents";
import { AttestationPanel } from "@/components/AttestationPanel";


export const Route = createFileRoute("/agents/yield")({
  head: () => ({
    meta: [
      { title: "Yieldra — Autonomous Yield Router | Multitude" },
      { name: "description", content: "Watch Yieldra compare DeFi opportunities on Casper by APY, risk, liquidity and confidence — then prepare a routed transaction." },
      { property: "og:title", content: "Yieldra — Autonomous Yield Router" },
      { property: "og:url", content: "/agents/yield" },
    ],
    links: [{ rel: "canonical", href: "/agents/yield" }],
  }),
  component: () => <AgentGate agent="yield"><Yield /></AgentGate>,
});

function Yield() {
  const [amount, setAmount] = useState(1000);
  const [riskTol, setRiskTol] = useState<"Low" | "Medium" | "High">("Medium");
  const ranked = [...YIELD_OPPS]
    .filter((o) => riskTol === "High" || o.risk !== "High")
    .filter((o) => riskTol === "Low" ? o.risk === "Low" : true)
    .map((o) => ({ ...o, score: o.apy * o.confidence - (o.risk === "Medium" ? 2 : 0) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header>
        <div className="text-xs text-primary font-mono mb-2">AGENT · YIELDRA 🌊</div>
        <h1 className="text-4xl font-bold mb-2">Autonomous yield-routing workflow</h1>
        <p className="text-muted-foreground">Yieldra evaluates Casper DeFi opportunities and routes capital with risk-aware logic.</p>
      </header>

      <AttestationPanel agent="yieldRouter" memoPrefix="yieldra.route" />



      <div className="glass-card p-6 grid md:grid-cols-3 gap-6">
        <label className="block">
          <span className="text-xs text-muted-foreground">Amount (CSPR)</span>
          <input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-input border border-border" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Risk tolerance</span>
          <select value={riskTol} onChange={(e) => setRiskTol(e.target.value as "Low" | "Medium" | "High")} className="w-full mt-1 px-3 py-2 rounded-md bg-input border border-border">
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </label>
        <div className="flex flex-col justify-end">
          <div className="text-xs text-muted-foreground">Best route</div>
          <div className="font-bold text-lg">{best?.protocol ?? "—"}</div>
          <div className="text-sm text-primary">{best ? `${best.apy}% APY · conf ${(best.confidence * 100).toFixed(0)}%` : ""}</div>
        </div>
      </div>

      <div className="glass-card p-6 overflow-x-auto">
        <h2 className="font-bold mb-4">Opportunities considered</h2>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground"><tr>
            <th className="text-left py-2">Protocol</th><th>APY</th><th>Risk</th><th>Liquidity</th><th>Confidence</th><th>Score</th>
          </tr></thead>
          <tbody>
            {ranked.map((o, i) => (
              <tr key={o.protocol} className={`border-t border-border ${i === 0 ? "bg-primary/10" : ""}`}>
                <td className="py-2 font-medium">{o.protocol}</td>
                <td className="text-success">{o.apy}%</td>
                <td>{o.risk}</td>
                <td>{o.liquidity}</td>
                <td>{(o.confidence * 100).toFixed(0)}%</td>
                <td className="font-mono">{o.score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold mb-3">Decision trace</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li>Fetched 5 opportunities via MCP <span className="font-mono text-foreground">casper.defi.list_pools</span></li>
            <li>Pulled real-time liquidity via CSPR.cloud reads</li>
            <li>Applied risk tolerance filter = <span className="text-foreground">{riskTol}</span></li>
            <li>Scored = APY × confidence − risk penalty</li>
            <li>Selected <span className="text-foreground font-semibold">{best?.protocol}</span></li>
            <li>Prepared deploy via Odra contract <span className="font-mono text-foreground">yield-router.odra v0.4.2</span></li>
          </ol>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-bold mb-3">Prepared transaction (mock)</h3>
          <pre className="text-xs bg-input p-4 rounded-md overflow-x-auto">
{`{
  "chain": "casper-mainnet",
  "from": "0x8f3a…9c2b",
  "contract": "yield-router.odra",
  "entry_point": "route_deposit",
  "args": {
    "protocol": "${best?.protocol}",
    "amount_cspr": ${amount},
    "max_slippage_bps": 30
  },
  "x402_budget": "0.05 CSPR",
  "signer": "cspr.click"
}`}
          </pre>
          <button className="mt-4 w-full py-2.5 rounded-md bg-primary text-primary-foreground font-semibold">Sign with CSPR.click (demo)</button>
        </div>
      </div>
    </div>
  );
}

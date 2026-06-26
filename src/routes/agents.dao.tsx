import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AgentGate } from "@/lib/personaAgents";


export const Route = createFileRoute("/agents/dao")({
  head: () => ({
    meta: [
      { title: "Quorra — Multi-Agent DAO Governance | CasperCrew" },
      { name: "description", content: "Risk, Treasury, Legal and Execution agents debate DAO proposals and recommend a vote — then settle on-chain." },
      { property: "og:title", content: "Quorra — Multi-Agent DAO Governance" },
      { property: "og:url", content: "/agents/dao" },
    ],
    links: [{ rel: "canonical", href: "/agents/dao" }],
  }),
  component: () => <AgentGate agent="dao"><DAO /></AgentGate>,
});

const DEBATE = [
  { who: "Risk Agent", stance: "PASS", color: "text-success", text: "Drawdown < 4%, max exposure within DAO policy." },
  { who: "Treasury Agent", stance: "PASS", color: "text-success", text: "Treasury runway unaffected; allocation 2.1% of AUM." },
  { who: "Legal Agent", stance: "CAUTION", color: "text-warning", text: "RWA partner KYC token expires in 14 days. Renewal required." },
  { who: "Execution Agent", stance: "READY", color: "text-primary", text: "Multisig pre-signed. Will execute on quorum." },
];

function DAO() {
  const [voted, setVoted] = useState(false);
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header>
        <div className="text-xs text-primary font-mono mb-2">AGENT · QUORRA 🗳️</div>
        <h1 className="text-4xl font-bold mb-2">Multi-agent DAO governance</h1>
        <p className="text-muted-foreground">Four specialized agents review every proposal. You stay in the loop with a clear recommendation.</p>
      </header>

      <div className="glass-card p-6">
        <div className="flex flex-wrap justify-between gap-3 mb-4">
          <div>
            <div className="text-xs text-muted-foreground">Proposal #214</div>
            <h2 className="font-bold text-xl">Allocate 500k CSPR to RWA-Bond Pool (12-month lockup)</h2>
          </div>
          <div className="text-xs glass-card px-3 py-1 self-start">Quorum: 62% · Ends in 2d 14h</div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {DEBATE.map((d) => (
            <div key={d.who} className="p-4 rounded-lg bg-secondary/40">
              <div className="flex justify-between items-center">
                <div className="font-semibold">{d.who}</div>
                <div className={`text-xs font-mono ${d.color}`}>{d.stance}</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{d.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold mb-3">Quorra recommends</h3>
          <div className="text-3xl font-bold text-success">PASS — with conditions</div>
          <ul className="text-sm text-muted-foreground mt-3 space-y-1 list-disc list-inside">
            <li>Renew RWA partner KYC token before execution</li>
            <li>Cap initial deployment at 250k CSPR; review at 30 days</li>
            <li>Sentinel to attach compliance attestation pre-execution</li>
          </ul>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-bold mb-3">Execute</h3>
          {voted ? (
            <div className="text-sm">
              <div className="text-success font-bold mb-2">✓ Vote recorded on Casper</div>
              <pre className="text-xs bg-input p-4 rounded-md overflow-x-auto">
{`{ "proposal": 214, "vote": "PASS",
  "voter": "0x8f3a…9c2b",
  "tx": "0xa910…44d2",
  "x402_paid": "0.003 CSPR" }`}</pre>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">Cast your vote following Quorra's recommendation. Execution Agent will settle once quorum is reached.</p>
              <div className="flex gap-2">
                <button onClick={() => setVoted(true)} className="flex-1 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold">Vote PASS</button>
                <button onClick={() => setVoted(true)} className="flex-1 py-2.5 rounded-md border border-border">Vote AGAINST</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

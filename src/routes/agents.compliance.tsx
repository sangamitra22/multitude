import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AgentGate } from "@/lib/personaAgents";
import { AttestationPanel } from "@/components/AttestationPanel";


export const Route = createFileRoute("/agents/compliance")({
  head: () => ({
    meta: [
      { title: "Sentinel — Privacy-Preserving KYC | Multitude" },
      { name: "description", content: "Sentinel runs KYC/AML checks with zero-knowledge attestations, issues Casper-anchored compliance tokens, and manages revocation." },
      { property: "og:title", content: "Sentinel — Privacy-Preserving KYC" },
      { property: "og:url", content: "/agents/compliance" },
    ],
    links: [{ rel: "canonical", href: "/agents/compliance" }],
  }),
  component: () => <AgentGate agent="compliance"><Compliance /></AgentGate>,
});

function Compliance() {
  const [step, setStep] = useState(0);
  const steps = ["Identity", "Sanctions", "ZK proof", "Issue token", "Done"];
  const advance = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header>
        <div className="text-xs text-primary font-mono mb-2">AGENT · SENTINEL 🔐</div>
        <h1 className="text-4xl font-bold mb-2">AI-driven KYC with zero-knowledge attestations</h1>
        <p className="text-muted-foreground">Prove compliance without revealing personal data. Casper holds the attestation; you keep the secrets.</p>
      </header>

      <AttestationPanel agent="sentinel" memoPrefix="sentinel.kyc" />



      <div className="glass-card p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className={`px-3 py-1.5 rounded-full text-xs font-mono border ${i <= step ? "bg-primary/15 border-primary text-primary" : "border-border text-muted-foreground"}`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {step === 0 && <Card title="Verify identity" body="Sentinel hashes your document locally. Only commitments leave your device." cta="Continue" onClick={advance} />}
        {step === 1 && <Card title="Sanctions & PEP screening" body="Cross-checked against 14 lists via an MCP server. 0 matches found." cta="Run ZK proof" onClick={advance} />}
        {step === 2 && (
          <div>
            <h3 className="font-bold mb-2">Generating ZK proof…</h3>
            <pre className="text-xs bg-input p-4 rounded-md overflow-x-auto">
{`circuit: kyc_v2
inputs:  { age >= 18, country in allowlist, sanctions = false }
proof:   0xc3aa…91ff (2,184 bytes)
verify:  ✓ in 312ms`}
            </pre>
            <button onClick={advance} className="mt-4 py-2.5 px-5 rounded-md bg-primary text-primary-foreground font-semibold">Issue compliance token</button>
          </div>
        )}
        {step === 3 && (
          <div>
            <h3 className="font-bold mb-2">Issuing on Casper…</h3>
            <pre className="text-xs bg-input p-4 rounded-md overflow-x-auto">
{`contract: sentinel.compliance.odra
mint:     KYC_TOKEN { holder: 0x8f3a…9c2b, expires: 2027-06-25 }
tx:       0xdd11…7720
x402:     0.004 CSPR`}</pre>
            <button onClick={advance} className="mt-4 py-2.5 px-5 rounded-md bg-primary text-primary-foreground font-semibold">Finish</button>
          </div>
        )}
        {step === 4 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="font-bold text-xl">Compliance token issued</h3>
            <p className="text-muted-foreground mt-2">Other Multitude agents can now verify your KYC status without ever seeing your data.</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          ["Issued (24h)", "12"],
          ["Revoked (24h)", "1"],
          ["Avg ZK verify", "320ms"],
        ].map(([t, v]) => (
          <div key={t} className="glass-card p-5"><div className="text-xs text-muted-foreground">{t}</div><div className="text-2xl font-bold mt-1">{v}</div></div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, body, cta, onClick }: { title: string; body: string; cta: string; onClick: () => void }) {
  return (
    <div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{body}</p>
      <button onClick={onClick} className="py-2.5 px-5 rounded-md bg-primary text-primary-foreground font-semibold">{cta}</button>
    </div>
  );
}

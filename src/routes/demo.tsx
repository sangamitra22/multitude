import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useCasperWallet } from "@/lib/casper/wallet";
import { runPreflight } from "@/lib/preflight";
import { getContractsConfig } from "@/lib/casper/config";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Judge Demo Mode — Multitude" },
      { name: "description", content: "Step-by-step walkthrough for judges: connect Casper Wallet, execute a real Testnet deploy, and export the finalized receipt." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoMode,
});

type StepState = "pending" | "active" | "done";

function DemoMode() {
  const { status, publicKey, network, extensionAvailable, connect } = useCasperWallet();
  const [ackPreflight, setAckPreflight] = useState(false);
  const [broadcasted, setBroadcasted] = useState(false);
  const [exported, setExported] = useState(false);

  const preflight = useMemo(() => runPreflight(), []);
  const x402 = getContractsConfig(network.id).x402;

  useEffect(() => {
    const onExport = () => setExported(true);
    const onBroadcast = () => setBroadcasted(true);
    window.addEventListener("multitude:demo:receipt-exported", onExport);
    window.addEventListener("multitude:demo:deploy-broadcast", onBroadcast);
    return () => {
      window.removeEventListener("multitude:demo:receipt-exported", onExport);
      window.removeEventListener("multitude:demo:deploy-broadcast", onBroadcast);
    };
  }, []);

  const steps: { title: string; body: React.ReactNode; state: StepState; action?: React.ReactNode }[] = [
    {
      title: "1. Preflight the environment",
      state: ackPreflight ? "done" : "active",
      body: (
        <>
          <p>Startup preflight checks RPC endpoints, explorer URLs, contract hashes, and x402 routing per network.</p>
          <div className={`mt-2 text-xs px-2 py-1 rounded inline-block ${preflight.ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
            {preflight.ok ? `Preflight passed · ${preflight.issues.length} warnings` : `Preflight failed · ${preflight.issues.length} issues`}
          </div>
        </>
      ),
      action: (
        <button onClick={() => setAckPreflight(true)} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
          Got it — continue
        </button>
      ),
    },
    {
      title: "2. Connect Casper Wallet",
      state: publicKey ? "done" : ackPreflight ? "active" : "pending",
      body: (
        <>
          <p>Install the <a href="https://www.casperwallet.io/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Casper Wallet</a> browser extension, unlock a key, and connect. Current network: <span className="font-semibold">{network.label}</span>.</p>
          {publicKey && <div className="mt-2 font-mono text-xs break-all text-success">Connected: {publicKey}</div>}
          {!extensionAvailable && <div className="mt-2 text-xs text-warning">Extension not detected — install Casper Wallet, then refresh.</div>}
        </>
      ),
      action: publicKey ? null : (
        <button onClick={connect} disabled={!extensionAvailable || status === "connecting"} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50">
          {status === "connecting" ? "Connecting…" : "Connect wallet"}
        </button>
      ),
    },
    {
      title: "3. Execute a real deploy",
      state: broadcasted ? "done" : publicKey ? "active" : "pending",
      body: (
        <>
          <p>Head to the <Link to="/wallet" className="text-primary hover:underline">Wallet Operations Console</Link> and either:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
            <li>Sign a native transfer to any recipient public key (≥ 2.5 CSPR), or</li>
            <li>Click <span className="font-semibold">Broadcast x402</span> to route the configured micropayment {x402.recipientPublicKeyHex ? `to ${x402.recipientPublicKeyHex.slice(0, 8)}…` : "(configure the recipient in Settings first)"}.</li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">The pipeline in the drawer moves Signed → Broadcasting → Executed → Finalized based on real <span className="font-mono">info_get_deploy</span> polling. On Testnet, grab CSPR from the <a href="https://testnet.cspr.live/tools/faucet" target="_blank" rel="noreferrer" className="text-primary hover:underline">faucet</a> if needed.</p>
        </>
      ),
      action: publicKey ? (
        <div className="flex gap-2">
          <Link to="/wallet" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold">Open Wallet console</Link>
          <button onClick={() => setBroadcasted(true)} className="px-3 py-1.5 rounded-md border border-border text-xs">Mark as done</button>
        </div>
      ) : null,
    },
    {
      title: "4. Export the finalized receipt",
      state: exported ? "done" : broadcasted ? "active" : "pending",
      body: (
        <>
          <p>Open the transaction from the wallet drawer once it reaches <span className="font-semibold text-success">Finalized</span>. In the receipt panel you have:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
            <li><span className="font-semibold">Download receipt JSON</span> — bundled raw + decoded, ready to attach to a submission.</li>
            <li>Export raw / decoded JSON separately, or copy raw to clipboard.</li>
            <li>Verify on the Casper Explorer via the direct link.</li>
          </ul>
        </>
      ),
      action: broadcasted ? (
        <button onClick={() => setExported(true)} className="px-3 py-1.5 rounded-md border border-border text-xs">Mark exported</button>
      ) : null,
    },
    {
      title: "5. Submit",
      state: exported ? "active" : "pending",
      body: <p>Attach the downloaded JSON file(s) alongside the pitch deck and repo link. That's the entire live-transaction proof judges need.</p>,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <header>
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">Judge demo mode</div>
        <h1 className="text-3xl font-bold mt-1">Multitude · 5-step live walkthrough</h1>
        <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
          A guided path from configuration check to a real, finalized Casper deploy with an exportable receipt file — designed so judges can verify the whole pipeline in under 3 minutes.
        </p>
      </header>

      <ol className="space-y-4">
        {steps.map((s, i) => {
          const badge = s.state === "done" ? "bg-success/20 text-success" : s.state === "active" ? "bg-primary/20 text-primary animate-pulse" : "bg-muted text-muted-foreground";
          return (
            <li key={i} className={`glass-card p-5 ${s.state === "active" ? "ring-1 ring-primary/40" : ""}`}>
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold shrink-0 ${badge}`}>
                  {s.state === "done" ? "✓" : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{s.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.body}</div>
                  {s.action && <div className="mt-3">{s.action}</div>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="glass-card p-5 text-xs text-muted-foreground">
        <div className="font-semibold text-foreground mb-1">Tips for judges</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Every field in the drawer receipt maps 1:1 to <span className="font-mono">info_get_deploy</span> output on cspr.live.</li>
          <li>Preflight failures block the app entirely — no silent misconfiguration.</li>
          <li>All illustrative demo rows in wallet history are clearly labeled "demo data".</li>
        </ul>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { TXS } from "@/lib/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";


export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Multitude" },
      { name: "description", content: "Wallet operations console: connect, sign, and review on-chain history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Wallet,
});

const MOCK_ADDR = "0x8f3a2c1d9b4e5f6a7c8d9e0f1a2b3c4d5e6f9c2b";

interface SignedTx {
  id: string;
  to: string;
  amount: string;
  memo: string;
  hash: string;
  time: string;
  status: "Signed" | "Broadcasting" | "Confirmed";
}

function Wallet() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState<SignedTx[]>([]);
  const [form, setForm] = useState({ to: "casper1q...recipient", amount: "100", memo: "Agent settlement" });
  const [selectedTx, setSelectedTx] = useState<(typeof TXS)[number] | null>(null);


  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Sign in required</h1>
        <Link to="/login" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold">Go to login</Link>
      </div>
    );
  }

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!connected) return;
    setSigning(true);
    const hash = "0x" + Math.random().toString(16).slice(2, 10) + "…" + Math.random().toString(16).slice(2, 6);
    const id = crypto.randomUUID();
    await new Promise((r) => setTimeout(r, 900));
    setSigned((s) => [{ id, to: form.to, amount: form.amount, memo: form.memo, hash, time: "just now", status: "Signed" }, ...s]);
    await new Promise((r) => setTimeout(r, 700));
    setSigned((s) => s.map((t) => t.id === id ? { ...t, status: "Broadcasting" } : t));
    await new Promise((r) => setTimeout(r, 900));
    setSigned((s) => s.map((t) => t.id === id ? { ...t, status: "Confirmed" } : t));
    setSigning(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet Operations Console</h1>
        <p className="text-muted-foreground mt-1">Simulated CSPR.click wallet · signing flows are mocked for the prototype.</p>
      </div>

      {/* Connection */}
      <div className="glass-card p-6 grid md:grid-cols-[1fr_auto] gap-4 items-center">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Wallet status</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            <span className="font-semibold">{connected ? "Connected" : "Disconnected"}</span>
          </div>
          {connected && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="font-mono text-sm break-all">{MOCK_ADDR}</div>
              <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Balance</div><div className="font-semibold">12,481 CSPR</div></div>
                <div><div className="text-xs text-muted-foreground">Network</div><div className="font-semibold">Casper Mainnet</div></div>
                <div><div className="text-xs text-muted-foreground">Nonce</div><div className="font-semibold">217</div></div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setConnected((c) => !c)}
          className={`px-5 py-2.5 rounded-md font-semibold transition ${connected ? "border border-border hover:bg-secondary" : "bg-primary text-primary-foreground hover:opacity-90"}`}
        >
          {connected ? "Disconnect" : "Connect wallet"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sign tx */}
        <form onSubmit={handleSign} className="glass-card p-6 space-y-4">
          <h2 className="font-bold">Sign a transaction</h2>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">Recipient</span>
            <input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm font-mono" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs text-muted-foreground mb-1">Amount (CSPR)</span>
              <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </label>
            <label className="block">
              <span className="block text-xs text-muted-foreground mb-1">Memo</span>
              <input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </label>
          </div>
          <button
            disabled={!connected || signing}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {signing ? "Signing…" : connected ? "Sign & broadcast" : "Connect wallet to sign"}
          </button>
          <p className="text-xs text-muted-foreground">Signature simulated client-side via CSPR.click skill mock. No real funds move.</p>
        </form>

        {/* Signed history */}
        <div className="glass-card p-6">
          <h2 className="font-bold mb-4">Signed transactions</h2>
          {signed.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No signed transactions yet. Try the form on the left.</div>
          ) : (
            <ul className="space-y-3">
              {signed.map((t) => (
                <li key={t.id} className="p-3 rounded-lg bg-secondary/40 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-xs">{t.hash}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "Confirmed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{t.status}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.amount} CSPR → <span className="font-mono">{t.to}</span></div>
                  <div className="text-xs text-muted-foreground">"{t.memo}" · {t.time}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <FullHistory onSelect={setSelectedTx} />


      <TxDetailsDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}

type Tx = (typeof TXS)[number];

function TxDetailsDrawer({ tx, onClose }: { tx: Tx | null; onClose: () => void }) {
  const steps: { label: string; detail: string; done: boolean }[] = tx
    ? [
        { label: "Intent built", detail: `Agent ${tx.agent} composed the call from MCP context.`, done: true },
        { label: "x402 budget reserved", detail: "0.0042 CSPR earmarked for downstream MCP + CSPR.cloud calls.", done: true },
        { label: "CSPR.click signature", detail: "Signed locally by user wallet 0x8f3a…9c2b (ed25519).", done: true },
        { label: "Broadcast to Casper", detail: "Submitted via CSPR.cloud RPC pool · gossip latency 142ms.", done: true },
        { label: "On-chain inclusion", detail: tx.status === "Confirmed" ? "Included in block #2,481,902 — finalized." : "Awaiting validator quorum (3 of 5).", done: tx.status === "Confirmed" },
        { label: "Audit log", detail: "Appended to Multitude monitoring trail with agent + persona attribution.", done: tx.status === "Confirmed" },
      ]
    : [];

  return (
    <Sheet open={!!tx} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {tx && (
          <>
            <SheetHeader>
              <SheetTitle className="font-mono text-base">{tx.hash}</SheetTitle>
              <SheetDescription>{tx.action}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status" value={
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === "Confirmed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{tx.status}</span>
                } />
                <Field label="Submitted" value={tx.time} />
                <Field label="Initiating agent" value={<span className="text-primary">{tx.agent}</span>} />
                <Field label="Network" value="Casper Mainnet" />
                <Field label="Gas (mock)" value="0.18 CSPR" />
                <Field label="Block" value={tx.status === "Confirmed" ? "#2,481,902" : "pending"} />
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Signed by</div>
                <div className="p-3 rounded-lg bg-secondary/40 space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">User wallet</span><span className="font-mono text-xs">0x8f3a…9c2b</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Agent key</span><span className="font-mono text-xs">agent:{tx.agent.toLowerCase()}#01</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Signer skill</span><span>CSPR.click</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Scheme</span><span>ed25519</span></div>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Simulated on-chain pipeline</div>
                <ol className="space-y-3">
                  {steps.map((s, i) => (
                    <li key={s.label} className="flex gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded-full grid place-items-center text-xs font-bold shrink-0 ${s.done ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                        {s.done ? "✓" : i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold">{s.label}</div>
                        <div className="text-xs text-muted-foreground">{s.detail}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-xs text-muted-foreground">Mock data for prototype demo. No real funds move on Casper.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/40">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold text-sm">{value}</div>
    </div>
  );
}


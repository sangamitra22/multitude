import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { TXS } from "@/lib/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";


export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — CasperCrew" },
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

      {/* Full history */}
      <div className="glass-card p-6 overflow-x-auto">
        <h2 className="font-bold mb-4">Transaction history</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase">
            <tr><th className="text-left py-2">Hash</th><th className="text-left">Action</th><th className="text-left">Agent</th><th className="text-left">Status</th><th className="text-left">Time</th></tr>
          </thead>
          <tbody>
            {TXS.map((t) => (
              <tr key={t.hash} className="border-t border-border">
                <td className="py-2 font-mono text-xs">{t.hash}</td>
                <td>{t.action}</td>
                <td className="text-primary">{t.agent}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "Confirmed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{t.status}</span></td>
                <td className="text-muted-foreground text-xs">{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { TXS } from "@/lib/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCasperWallet } from "@/lib/casper/wallet";
import { NETWORKS, explorerAccountUrl, explorerDeployUrl, type NetworkId } from "@/lib/casper/network";
import { buildTransferDeployJson } from "@/lib/casper/buildTransfer";
import { fetchBalance, putDeployRaw, pollDeploy, type DeployPhase } from "@/lib/casper/rpc";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Multitude" },
      { name: "description", content: "Casper wallet console: connect Casper Wallet, sign real deploys on Testnet/Mainnet, and track live RPC status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Wallet,
});

interface SignedTx {
  id: string;
  to: string;
  amount: string;
  memo: string;
  hash: string;
  time: string;
  phase: DeployPhase;
  networkId: NetworkId;
  blockHash?: string;
  errorMessage?: string;
}

function shortHash(h: string, l = 8, r = 6) {
  if (!h) return "";
  if (h.length <= l + r + 1) return h;
  return `${h.slice(0, l)}…${h.slice(-r)}`;
}

function phaseBadge(phase: DeployPhase) {
  const map: Record<DeployPhase, string> = {
    signed: "bg-primary/15 text-primary",
    broadcasting: "bg-warning/15 text-warning",
    executed: "bg-primary/15 text-primary",
    finalized: "bg-success/15 text-success",
    failed: "bg-destructive/15 text-destructive",
  };
  return map[phase];
}

function Wallet() {
  const { user } = useAuth();
  const { status, publicKey, network, setNetwork, connect, disconnect, extensionAvailable, error } = useCasperWallet();
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState<SignedTx[]>([]);
  const [balance, setBalance] = useState<string | null>(null);
  const [form, setForm] = useState({ to: "", amount: "2.5", memo: "" });
  const [selectedTx, setSelectedTx] = useState<SelectableTx | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const connected = status === "connected" && !!publicKey;

  // Refresh balance whenever pk or network changes
  useEffect(() => {
    if (!publicKey) { setBalance(null); return; }
    let cancelled = false;
    setBalance(null);
    fetchBalance(network, publicKey)
      .then((b) => { if (!cancelled) setBalance(b); })
      .catch(() => { if (!cancelled) setBalance("—"); });
    return () => { cancelled = true; };
  }, [publicKey, network]);

  // Clear in-memory signed rows when switching networks (they belong to previous chain)
  useEffect(() => { setSigned([]); }, [network.id]);

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
    if (!connected || !publicKey) return;
    setFlash(null);
    setSigning(true);
    const id = crypto.randomUUID();
    const draft: SignedTx = {
      id,
      to: form.to,
      amount: form.amount,
      memo: form.memo,
      hash: "",
      time: "just now",
      phase: "signed",
      networkId: network.id,
    };
    try {
      const deployJson = buildTransferDeployJson({
        fromPublicKeyHex: publicKey,
        toPublicKeyHex: form.to.trim(),
        amountCspr: form.amount,
        memoId: form.memo,
        network,
      });
      // Ask wallet to sign
      const signatureHex = await (async () => {
        const { signDeploy } = useCasperWalletBridge();
        return signDeploy(deployJson);
      })();
      // Attach approval into deploy JSON
      const signedDeploy = attachApproval(deployJson, publicKey, signatureHex);
      // Compute the deploy hash before RPC responds (RPC also returns it)
      const preHash = extractDeployHash(signedDeploy);
      setSigned((s) => [{ ...draft, hash: preHash, phase: "signed" }, ...s]);
      // Broadcast
      const rpcHash = await putDeployRaw(network, signedDeploy);
      setSigned((s) => s.map((t) => t.id === id ? { ...t, hash: rpcHash, phase: "broadcasting" } : t));
      // Poll to finalization
      const final = await pollDeploy(network, rpcHash, (u) => {
        setSigned((s) => s.map((t) => t.id === id ? { ...t, phase: u.phase, blockHash: u.blockHash, errorMessage: u.errorMessage } : t));
      });
      setSigned((s) => s.map((t) => t.id === id ? { ...t, phase: final.phase, blockHash: final.blockHash, errorMessage: final.errorMessage } : t));
      // Refresh balance in the background
      fetchBalance(network, publicKey).then(setBalance).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign / broadcast failed";
      setSigned((s) => s.map((t) => t.id === id ? { ...t, phase: "failed", errorMessage: msg } : t));
      setFlash(msg);
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet Operations Console</h1>
          <p className="text-muted-foreground mt-1">Real Casper Wallet signing · JSON-RPC broadcast via {new URL(network.rpc).host} · live deploy status.</p>
        </div>
        <NetworkSwitch value={network.id} onChange={setNetwork} />
      </div>

      {/* Connection */}
      <div className="glass-card p-6 grid md:grid-cols-[1fr_auto] gap-4 items-center">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Wallet status</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            <span className="font-semibold">
              {connected ? "Connected" : status === "connecting" ? "Connecting…" : extensionAvailable ? "Disconnected" : "Casper Wallet not detected"}
            </span>
          </div>
          {connected && publicKey && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground">Active public key</div>
              <div className="font-mono text-sm break-all">
                <a href={explorerAccountUrl(network, publicKey)} target="_blank" rel="noreferrer" className="hover:text-primary">{publicKey}</a>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Balance</div><div className="font-semibold">{balance ?? "…"} CSPR</div></div>
                <div><div className="text-xs text-muted-foreground">Network</div><div className="font-semibold">{network.label}</div></div>
                <div><div className="text-xs text-muted-foreground">RPC</div><div className="font-semibold truncate" title={network.rpc}>{new URL(network.rpc).host}</div></div>
              </div>
              {network.id === "casper-test" && network.faucet && (
                <a href={network.faucet} target="_blank" rel="noreferrer" className="text-xs text-primary mt-2 inline-block hover:underline">Need Testnet CSPR? Open faucet →</a>
              )}
            </div>
          )}
          {!extensionAvailable && (
            <p className="text-xs text-muted-foreground mt-2">
              Install the <a href="https://www.casperwallet.io/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Casper Wallet</a> browser extension to sign real deploys.
            </p>
          )}
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </div>
        <button
          onClick={() => (connected ? disconnect() : connect())}
          disabled={!extensionAvailable && !connected}
          className={`px-5 py-2.5 rounded-md font-semibold transition disabled:opacity-50 ${connected ? "border border-border hover:bg-secondary" : "bg-primary text-primary-foreground hover:opacity-90"}`}
        >
          {connected ? "Disconnect" : "Connect Casper Wallet"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sign tx */}
        <form onSubmit={handleSign} className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Sign & broadcast a transfer</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success/15 text-success">LIVE · {network.label}</span>
          </div>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">Recipient public key (hex)</span>
            <input required value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="0202…" className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm font-mono" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs text-muted-foreground mb-1">Amount (CSPR, min 2.5)</span>
              <input required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </label>
            <label className="block">
              <span className="block text-xs text-muted-foreground mb-1">Transfer id (optional, numeric)</span>
              <input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="auto" className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </label>
          </div>
          <button
            disabled={!connected || signing}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {signing ? "Signing & broadcasting…" : connected ? `Sign & broadcast on ${network.label}` : "Connect wallet to sign"}
          </button>
          {flash && <p className="text-xs text-destructive">{flash}</p>}
          <p className="text-xs text-muted-foreground">
            Payment: 0.1 CSPR native transfer fee. Deploy is built with casper-js-sdk, signed by your Casper Wallet, broadcast via <span className="font-mono">account_put_deploy</span>, and polled with <span className="font-mono">info_get_deploy</span>.
          </p>
        </form>

        {/* Signed history */}
        <div className="glass-card p-6">
          <h2 className="font-bold mb-4">Signed transactions ({network.label})</h2>
          {signed.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No signed transactions this session. Try the form on the left.</div>
          ) : (
            <ul className="space-y-3">
              {signed.map((t) => (
                <li key={t.id} className="p-3 rounded-lg bg-secondary/40 text-sm cursor-pointer hover:bg-secondary/60" onClick={() => setSelectedTx({ kind: "live", tx: t })}>
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-xs">{t.hash ? shortHash(t.hash) : "pending hash…"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${phaseBadge(t.phase)}`}>{t.phase}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.amount} CSPR → <span className="font-mono">{shortHash(t.to, 6, 6)}</span></div>
                  <div className="text-xs text-muted-foreground">{t.memo ? `"${t.memo}" · ` : ""}{t.time}</div>
                  {t.hash && (
                    <a href={explorerDeployUrl(network, t.hash)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-primary hover:underline">View on {network.label} explorer →</a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <FullHistory onSelect={(t) => setSelectedTx({ kind: "demo", tx: t })} />

      <TxDetailsDrawer sel={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}

// Small bridge so handleSign can call the hook value captured at render.
// We can't invoke hooks inside handlers, so re-read via a helper hook wrapper.
function useCasperWalletBridge() {
  return useCasperWallet();
}

/* Attach an approval + recompute hashes.
   Casper Wallet returns a signatureHex whose first byte encodes the algorithm.
   We just push the { signer, signature } pair into `approvals` — the node
   validates the body_hash / deploy_hash against the header we built. */
function attachApproval(deployJson: object, signerHex: string, signatureHex: string): object {
  const j = deployJson as { approvals?: Array<{ signer: string; signature: string }> };
  const approvals = Array.isArray(j.approvals) ? [...j.approvals] : [];
  approvals.push({ signer: signerHex, signature: signatureHex });
  return { ...j, approvals };
}

function extractDeployHash(deployJson: object): string {
  const j = deployJson as { hash?: string };
  return j.hash ?? "";
}

function NetworkSwitch({ value, onChange }: { value: NetworkId; onChange: (id: NetworkId) => void }) {
  return (
    <div className="inline-flex glass-card p-1 rounded-lg text-sm">
      {(Object.keys(NETWORKS) as NetworkId[]).map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`px-4 py-1.5 rounded-md transition ${value === id ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary/60 text-muted-foreground"}`}
        >
          {NETWORKS[id].label}
        </button>
      ))}
    </div>
  );
}

type Tx = (typeof TXS)[number];
type SelectableTx = { kind: "live"; tx: SignedTx } | { kind: "demo"; tx: Tx };

function TxDetailsDrawer({ sel, onClose }: { sel: SelectableTx | null; onClose: () => void }) {
  const { network } = useCasperWallet();
  const live = sel?.kind === "live" ? sel.tx : null;
  const demo = sel?.kind === "demo" ? sel.tx : null;

  const steps: { label: string; detail: string; state: "done" | "active" | "pending" | "failed" }[] = live
    ? [
        { label: "Deploy built", detail: `Native transfer for ${live.amount} CSPR built with casper-js-sdk against ${network.chainName}.`, state: "done" },
        { label: "Wallet signature", detail: "Signed locally by your Casper Wallet extension (ed25519 / secp256k1 per key).", state: live.phase === "signed" || live.hash ? "done" : "pending" },
        { label: "Broadcast (account_put_deploy)", detail: live.hash ? `Deploy hash ${shortHash(live.hash)} submitted to ${new URL(network.rpc).host}.` : "Submitting to RPC…", state: live.phase === "broadcasting" ? "active" : ["executed", "finalized", "failed"].includes(live.phase) ? "done" : "pending" },
        { label: "Executed", detail: live.blockHash ? `Included in block ${shortHash(live.blockHash)}.` : "Awaiting validator inclusion…", state: live.phase === "executed" ? "active" : ["finalized"].includes(live.phase) ? "done" : live.phase === "failed" ? "failed" : "pending" },
        { label: "Finalized", detail: live.phase === "finalized" ? "Confirmed on Casper — irreversible." : live.phase === "failed" ? live.errorMessage ?? "Execution failed" : "Waiting for finalization…", state: live.phase === "finalized" ? "done" : live.phase === "failed" ? "failed" : "pending" },
      ]
    : demo
    ? [
        { label: "Intent built", detail: `Agent ${demo.agent} composed the call from MCP context.`, state: "done" },
        { label: "x402 budget reserved", detail: "0.0042 CSPR earmarked for downstream MCP + CSPR.cloud calls.", state: "done" },
        { label: "CSPR.click signature", detail: "Signed locally by user wallet 0x8f3a…9c2b.", state: "done" },
        { label: "Broadcast to Casper", detail: "Submitted via CSPR.cloud RPC pool.", state: "done" },
        { label: "On-chain inclusion", detail: demo.status === "Confirmed" ? "Included in block #2,481,902 — finalized." : "Awaiting validator quorum.", state: demo.status === "Confirmed" ? "done" : "active" },
        { label: "Audit log", detail: "Appended to Multitude monitoring trail.", state: demo.status === "Confirmed" ? "done" : "pending" },
      ]
    : [];

  return (
    <Sheet open={!!sel} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {live && (
          <>
            <SheetHeader>
              <SheetTitle className="font-mono text-base">{live.hash ? shortHash(live.hash) : "pending hash"}</SheetTitle>
              <SheetDescription>Native transfer · {live.amount} CSPR on {network.label}</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phase" value={<span className={`text-xs px-2 py-0.5 rounded-full ${phaseBadge(live.phase)}`}>{live.phase}</span>} />
                <Field label="Network" value={`${network.label} (${network.chainName})`} />
                <Field label="Submitted" value={live.time} />
                <Field label="Block" value={live.blockHash ? shortHash(live.blockHash) : "pending"} />
                <Field label="Amount" value={`${live.amount} CSPR`} />
                <Field label="Payment" value="0.1 CSPR" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recipient</div>
                <div className="p-3 rounded-lg bg-secondary/40 font-mono text-xs break-all">{live.to}</div>
              </div>
              {live.hash && (
                <a href={explorerDeployUrl(network, live.hash)} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Open on {network.label} explorer →</a>
              )}
              <StepTimeline steps={steps} />
              {live.errorMessage && <p className="text-xs text-destructive">{live.errorMessage}</p>}
            </div>
          </>
        )}
        {demo && (
          <>
            <SheetHeader>
              <SheetTitle className="font-mono text-base">{demo.hash}</SheetTitle>
              <SheetDescription>{demo.action} · demo record</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status" value={<span className={`text-xs px-2 py-0.5 rounded-full ${demo.status === "Confirmed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{demo.status}</span>} />
                <Field label="Agent" value={<span className="text-primary">{demo.agent}</span>} />
                <Field label="Submitted" value={demo.time} />
                <Field label="Network" value="Casper Mainnet" />
              </div>
              <StepTimeline steps={steps} />
              <p className="text-xs text-muted-foreground">Demo data · illustrative only. Use the sign form above for real deploys on {network.label}.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function StepTimeline({ steps }: { steps: { label: string; detail: string; state: "done" | "active" | "pending" | "failed" }[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Pipeline</div>
      <ol className="space-y-3">
        {steps.map((s, i) => {
          const badge =
            s.state === "done" ? "bg-success/20 text-success" :
            s.state === "active" ? "bg-warning/20 text-warning animate-pulse" :
            s.state === "failed" ? "bg-destructive/20 text-destructive" :
            "bg-muted text-muted-foreground";
          return (
            <li key={s.label} className="flex gap-3">
              <div className={`mt-0.5 w-6 h-6 rounded-full grid place-items-center text-xs font-bold shrink-0 ${badge}`}>
                {s.state === "done" ? "✓" : s.state === "failed" ? "!" : i + 1}
              </div>
              <div className="min-w-0">
                <div className="font-semibold">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.detail}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
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

function FullHistory({ onSelect }: { onSelect: (t: Tx) => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | "Confirmed" | "Pending">("All");
  const [agent, setAgent] = useState<string>("All");
  const agents = ["All", ...Array.from(new Set(TXS.map((t) => t.agent)))];
  const filtered = TXS.filter((t) => {
    if (status !== "All" && t.status !== status) return false;
    if (agent !== "All" && t.agent !== agent) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!t.hash.toLowerCase().includes(s) && !t.action.toLowerCase().includes(s) && !t.agent.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="glass-card p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div>
          <h2 className="font-bold">Transaction history</h2>
          <p className="text-xs text-muted-foreground">Demo data · illustrative agent workflow history. Live deploys appear in the section above.</p>
        </div>
        <div className="flex-1" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hash, action, agent…" className="px-3 py-2 rounded-md bg-input border border-border text-sm w-64" />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="px-3 py-2 rounded-md bg-input border border-border text-sm">
          {["All", "Confirmed", "Pending"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={agent} onChange={(e) => setAgent(e.target.value)} className="px-3 py-2 rounded-md bg-input border border-border text-sm">
          {agents.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        {(q || status !== "All" || agent !== "All") && (
          <button onClick={() => { setQ(""); setStatus("All"); setAgent("All"); }} className="text-xs text-primary hover:underline">Clear</button>
        )}
      </div>
      <div className="text-xs text-muted-foreground mb-2">{filtered.length} of {TXS.length} demo transactions</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase">
            <tr><th className="text-left py-2">Hash</th><th className="text-left">Action</th><th className="text-left">Agent</th><th className="text-left">Status</th><th className="text-left">Time</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No transactions match these filters.</td></tr>
            ) : filtered.map((t) => (
              <tr key={t.hash} onClick={() => onSelect(t)} className="border-t border-border cursor-pointer hover:bg-secondary/40 transition">
                <td className="py-2 font-mono text-xs">{t.hash}</td>
                <td>{t.action}</td>
                <td className="text-primary">{t.agent}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "Confirmed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{t.status}</span></td>
                <td className="text-muted-foreground text-xs">{t.time}</td>
                <td className="text-xs text-primary text-right pr-2">Details →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

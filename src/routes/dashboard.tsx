import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth, PERSONA_LABELS } from "@/lib/auth";
import { AGENTS, TXS, MICROPAYMENTS, ALERTS } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CasperCrew" },
      { name: "description", content: "Your CasperCrew control center: agents, wallet, micropayments, on-chain actions and alerts." },
      { property: "og:title", content: "Dashboard — CasperCrew" },
      { property: "og:url", content: "/dashboard" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Please sign in</h1>
        <p className="text-muted-foreground mb-6">Your CasperCrew dashboard is protected.</p>
        <Link to="/login" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 text-2xl">👋</div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{PERSONA_LABELS[user.persona]}</div>
            <h1 className="truncate text-xl sm:text-2xl font-bold">Welcome, {user.name}</h1>
          </div>
        </div>
        <div className="glass-card px-4 py-2 text-xs font-mono">
          <div className="text-muted-foreground">Casper wallet</div>
          <div>0x8f3a…9c2b · <span className="text-success">connected</span></div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Active agents", "6", "all healthy"],
          ["Portfolio", "12,481 CSPR", "+2.4% 24h"],
          ["x402 spend (24h)", "0.482 CSPR", "283 calls"],
          ["Risk score", "Low · 21/100", "1 warning"],
        ].map(([t, v, s]) => (
          <div key={t} className="glass-card p-5">
            <div className="text-xs text-muted-foreground">{t}</div>
            <div className="text-2xl font-bold mt-1">{v}</div>
            <div className="text-xs text-primary mt-1">{s}</div>
          </div>
        ))}
      </div>

      {/* Persona card */}
      <PersonaCard persona={user.persona} />

      {/* Agents */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="font-bold mb-4">Your crew</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {AGENTS.map((a) => (
              <Link key={a.id} to={routeForAgent(a.id)} className="p-3 rounded-lg bg-secondary/40 hover:bg-secondary transition flex items-center gap-3">
                <div className="text-2xl">{a.emoji}</div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.role}</div>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-bold mb-4">Alerts</h2>
          <ul className="space-y-3">
            {ALERTS.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${a.level === "warn" ? "bg-warning" : a.level === "success" ? "bg-success" : "bg-primary"}`} />
                <div className="min-w-0">
                  <div>{a.msg}</div>
                  <div className="text-xs text-muted-foreground">{a.time} ago</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transactions + Micropayments */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 overflow-x-auto">
          <h2 className="font-bold mb-4">Recent on-chain actions</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr><th className="text-left py-2">Tx</th><th className="text-left">Action</th><th className="text-left">Agent</th><th className="text-left">Status</th><th className="text-left">Time</th></tr>
            </thead>
            <tbody>
              {TXS.map((t) => (
                <tr key={t.hash} className="border-t border-border">
                  <td className="py-2 font-mono text-xs">{t.hash}</td>
                  <td>{t.action}</td>
                  <td className="text-primary">{t.agent}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "Confirmed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{t.status}</span>
                  </td>
                  <td className="text-muted-foreground text-xs">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-bold mb-4">x402 micropayments</h2>
          <ul className="space-y-3 text-sm">
            {MICROPAYMENTS.map((m) => (
              <li key={m.to} className="flex justify-between items-center">
                <div className="min-w-0">
                  <div className="truncate font-mono text-xs">{m.to}</div>
                  <div className="text-xs text-muted-foreground">{m.count} calls</div>
                </div>
                <div className="font-mono text-xs">{(m.amount * m.count).toFixed(4)} {m.unit}</div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            Settled via x402 over Casper. Pay-per-request, no upfront contracts.
          </div>
        </div>
      </div>

      {/* System health */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[["MCP servers", "4 / 4 online"], ["CSPR.cloud", "p99 142ms"], ["Odra contracts", "all current"]].map(([t, v]) => (
          <div key={t} className="glass-card p-4 flex justify-between items-center">
            <div>
              <div className="text-xs text-muted-foreground">{t}</div>
              <div className="font-semibold">{v}</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function routeForAgent(id: string) {
  if (id === "yield") return "/agents/yield" as const;
  if (id === "rwa") return "/agents/rwa" as const;
  if (id === "dao") return "/agents/dao" as const;
  if (id === "compliance") return "/agents/compliance" as const;
  return "/dashboard" as const;
}

function PersonaCard({ persona }: { persona: string }) {
  const map: Record<string, { title: string; items: string[] }> = {
    "defi-investor": { title: "Investor cockpit", items: ["Top yield: RWA-Bond Pool · 18.6% APY", "Auto-rebalance scheduled in 3h", "Yieldra suggests +5% stablecoin allocation"] },
    "rwa-operator": { title: "Operator console", items: ["3 oracle feeds active · 0 deviations", "Reputation score: 96/100", "Pending attestation: 'Treasury bill CUSIP 912797GR8'"] },
    "dao-manager": { title: "Governance desk", items: ["2 active proposals · 1 needs review", "Quorra recommends: pass #214, reject #215", "Treasury: 1.2M CSPR · runway 18 months"] },
    "compliance-officer": { title: "Compliance ops", items: ["12 KYC attestations issued today", "0 sanctions matches · 1 PEP review", "ZK proof verification p99: 320ms"] },
    developer: { title: "Builder workbench", items: ["MCP playground ready", "Last deploy: yield-router.odra v0.4.2", "Open: 'Add x402 cap to Verus'"] },
  };
  const card = map[persona] ?? map["defi-investor"];
  return (
    <div className="glass-card p-6">
      <div className="text-xs text-primary font-mono uppercase tracking-wider mb-2">Tailored for you</div>
      <h2 className="font-bold text-lg mb-3">{card.title}</h2>
      <ul className="grid sm:grid-cols-3 gap-3 text-sm">
        {card.items.map((i) => (
          <li key={i} className="p-3 rounded-lg bg-secondary/40">{i}</li>
        ))}
      </ul>
    </div>
  );
}

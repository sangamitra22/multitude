import { createFileRoute, Link } from "@tanstack/react-router";
import { AGENTS } from "@/lib/mockData";
import heroImg from "@/assets/multitude-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Multitude — Autonomous AI Agents for the Casper Economy" },
      { name: "description", content: "Meet Multitude: friendly autonomous AI agents that run DeFi, RWA, DAO governance and compliance on the Casper blockchain." },
      { property: "og:title", content: "Multitude — Autonomous AI Agents for Casper" },
      { property: "og:description", content: "A friendly crew of autonomous AI agents for the Casper economy." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return <section id={id} className={`max-w-7xl mx-auto px-6 py-20 ${className}`}>{children}</section>;
}

function Home() {
  return (
    <>
      {/* Hero */}
      <div className="hero-bg">
        <Section className="!py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground mb-6">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live prototype · Casper Agentic Buildathon
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto">
            Your friendly crew of <span className="glow-text">autonomous AI agents</span> for the Casper economy.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Multitude puts a team of specialized AI agents to work on DeFi, real-world assets,
            DAO governance, compliance and machine-to-machine commerce — using Casper as the
            trust layer.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 glow-border transition">
              Join the Crew →
            </Link>
            <Link to="/personas" className="px-6 py-3 rounded-lg border border-border hover:bg-secondary transition">
              Pick your persona
            </Link>
            <Link to="/architecture" className="px-6 py-3 rounded-lg border border-border hover:bg-secondary transition">
              See how it works
            </Link>
          </div>

          {/* floating ghosts */}
          <div className="mt-16 flex justify-center gap-8 flex-wrap">
            {AGENTS.slice(0, 6).map((a, i) => (
              <div key={a.id} className="animate-float text-5xl" style={{ animationDelay: `${i * 0.4}s` }} title={a.name}>
                {a.emoji}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Problem */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-sm text-primary font-mono uppercase tracking-wider mb-3">The problem</div>
            <h2 className="text-4xl font-bold mb-4">Web3 needs trusted, autonomous agents.</h2>
            <p className="text-muted-foreground text-lg">
              AI agents are starting to handle money, contracts and decisions — but they live in opaque
              silos, lack verifiable identity, and can't safely settle on most blockchains.
              The result: hallucinated trades, untraceable actions, and no shared trust layer.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              "No verifiable identity for AI agents",
              "Pay-per-call APIs with no on-chain settlement",
              "Off-chain data with no proof of origin",
              "DAO governance overloaded with proposals",
              "Compliance workflows that leak private data",
            ].map((p) => (
              <div key={p} className="glass-card p-4 flex items-start gap-3">
                <span className="text-destructive">✗</span><span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Solution */}
      <Section className="!pt-0">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-sm text-primary font-mono uppercase tracking-wider mb-3">The solution</div>
          <h2 className="text-4xl font-bold mb-4">A coordinated <span className="glow-text">crew of agents</span>, anchored to Casper.</h2>
          <p className="text-muted-foreground text-lg">
            Every agent has a Casper-rooted identity, pays for what it uses with x402 micropayments,
            queries data through MCP servers, signs with CSPR.click, and settles on Odra smart contracts.
            Humans stay in the loop with full audit trails.
          </p>
        </div>
      </Section>

      {/* Meet the crew */}
      <Section className="!pt-0">
        <h2 className="text-3xl font-bold mb-2">Meet the Crew</h2>
        <p className="text-muted-foreground mb-10">Specialized agents that collaborate on your behalf.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENTS.map((a) => (
            <div key={a.id} className="glass-card p-6 hover:glow-border transition group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition" style={{ filter: `drop-shadow(0 0 12px ${a.color})` }}>{a.emoji}</div>
              <div className="font-bold text-lg">{a.name}</div>
              <div className="text-xs text-primary mb-2 font-mono">{a.role}</div>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Why Casper */}
      <Section>
        <div className="glass-card p-10">
          <div className="text-sm text-primary font-mono uppercase tracking-wider mb-3">Why Casper?</div>
          <h2 className="text-4xl font-bold mb-6">A blockchain built for agents.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: "Predictable fees", d: "Stable, low-cost transactions agents can budget for." },
              { t: "Upgradable contracts", d: "Odra framework lets agents safely evolve their logic." },
              { t: "Strong identity", d: "Account-based model fits AI agent identity natively." },
              { t: "Auditability", d: "Every agent action is a verifiable on-chain event." },
              { t: "CSPR.cloud APIs", d: "Scalable read/write infrastructure for agent fleets." },
              { t: "x402 + MCP ready", d: "Pay-per-call and tool-use primitives fit Casper perfectly." },
            ].map((x) => (
              <div key={x.t}>
                <div className="font-semibold mb-1">{x.t}</div>
                <div className="text-sm text-muted-foreground">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Use cases */}
      <Section className="!pt-0">
        <h2 className="text-3xl font-bold mb-10">Interactive demo workflows</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { to: "/agents/yield", t: "Autonomous yield routing", d: "Compare APYs, risk, liquidity and confidence — then route capital." },
            { to: "/agents/rwa", t: "RWA oracle with verifiable identity", d: "Ingest off-chain data, score it, and post it on-chain with provenance." },
            { to: "/agents/dao", t: "Multi-agent DAO governance", d: "Risk, Treasury, Legal and Execution agents debate and act." },
            { to: "/agents/compliance", t: "Privacy-preserving KYC", d: "ZK attestations, compliance tokens, revoke lifecycle." },
          ].map((u) => (
            <Link key={u.to} to={u.to} className="glass-card p-6 hover:glow-border transition flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">{u.t}</div>
                <div className="text-sm text-muted-foreground">{u.d}</div>
              </div>
              <span className="text-primary text-xl">→</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Impact / Judges */}
      <Section>
        <div className="glass-card p-10">
          <div className="text-sm text-accent font-mono uppercase tracking-wider mb-3">Built for judges</div>
          <h2 className="text-4xl font-bold mb-6">Why Multitude can win.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["Innovation", "First friendly multi-agent crew that fuses MCP, x402, CSPR.click, CSPR.cloud and Odra into one cohesive product."],
              ["Feasibility", "Architected around the published Casper AI Toolkit — every primitive maps to a real or mockable integration."],
              ["Technical depth", "Wallet signing, micropayments, on-chain settlement, smart-contract generation and ZK-style compliance."],
              ["Real-world useful", "DeFi, governance, compliance, RWA and M2M commerce in one extensible platform."],
              ["Scalability", "Stateless agents + CSPR.cloud + pay-per-call MCP = horizontal scale by design."],
              ["Trust", "Every agent decision is auditable on Casper. Humans always hold the keys."],
            ].map(([t, d]) => (
              <div key={t}>
                <div className="font-semibold mb-1">{t}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Roadmap */}
      <Section className="!pt-0">
        <h2 className="text-3xl font-bold mb-10">Roadmap</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            ["Q1", "Prototype", "Crew UI, mock agents, dashboard, demo workflows."],
            ["Q2", "Casper testnet", "Wire CSPR.click signing, CSPR.cloud reads, first Odra contract."],
            ["Q3", "x402 + MCP", "Live agent-to-agent micropayments and MCP tool calls."],
            ["Q4", "Mainnet beta", "Audited contracts, persona marketplace, partner agents."],
          ].map(([q, t, d]) => (
            <div key={q} className="glass-card p-5">
              <div className="text-xs text-primary font-mono">{q}</div>
              <div className="font-semibold mt-1">{t}</div>
              <div className="text-sm text-muted-foreground mt-2">{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="glass-card p-10 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to deploy your crew?</h2>
          <p className="text-muted-foreground mb-6">Pick your persona and try the live dashboard prototype.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/signup" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">Get started</Link>
            <Link to="/docs" className="px-6 py-3 rounded-lg border border-border hover:bg-secondary transition">Read the docs</Link>
          </div>
        </div>
      </Section>
    </>
  );
}

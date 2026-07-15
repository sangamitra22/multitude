import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Developer Docs — Multitude" },
      { name: "description", content: "Build on Multitude: MCP tool calls, x402 micropayments, CSPR.click signing, CSPR.cloud reads and Odra contract scaffolding." },
      { property: "og:title", content: "Developer Docs — Multitude" },
      { property: "og:url", content: "/docs" },
    ],
    links: [{ rel: "canonical", href: "/docs" }],
  }),
  component: Docs,
});

function Docs() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <header>
        <h1 className="text-4xl font-bold mb-2">Developer documentation</h1>
        <p className="text-muted-foreground">Plug into the Multitude agent platform. Examples below use the Casper AI Toolkit primitives.</p>
      </header>

      <Block title="1. Define an agent">
{`import { defineAgent } from "@caspercrew/sdk";

export const yieldra = defineAgent({
  name: "Yieldra",
  description: "Autonomous yield router for Casper DeFi.",
  tools: ["mcp:casper.defi", "mcp:casper.price", "x402:rwa-data"],
  signer: "cspr.click",
  budget: { x402: "0.05 CSPR / request" },
});`}
      </Block>

      <Block title="2. Call an MCP tool">
{`const pools = await yieldra.tools["mcp:casper.defi"].list_pools({
  min_liquidity_cspr: 1_000_000,
});`}
      </Block>

      <Block title="3. Pay per request with x402">
{`const feed = await x402.get("https://rwa-data.cspr/brent", {
  budget: "0.02 CSPR",
  signer: yieldra.signer,
});`}
      </Block>

      <Block title="4. Sign and submit with CSPR.click">
{`const tx = await cspr.click.sign({
  contract: "yield-router.odra",
  entry_point: "route_deposit",
  args: { protocol: "CasperSwap LP", amount_cspr: 1000 },
});
await csprCloud.tx.submit(tx);`}
      </Block>

      <Block title="5. Generate a contract with Forge (Odra)">
{`forge.generate({
  template: "compliance-token",
  params: { issuer: "sentinel.cspr", ttl_days: 365 },
  deploy: true,
});`}
      </Block>

      <div className="glass-card p-6">
        <h2 className="font-bold mb-2">Casper AI Toolkit alignment</h2>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li><span className="text-foreground">MCP servers</span> — every Casper data domain is exposed as MCP tools.</li>
          <li><span className="text-foreground">x402</span> — per-call settlement is the default billing primitive.</li>
          <li><span className="text-foreground">CSPR.click</span> — wallet & signing skill used by all agents.</li>
          <li><span className="text-foreground">CSPR.cloud</span> — managed indexed reads + submission API.</li>
          <li><span className="text-foreground">Odra</span> — Forge agent generates and upgrades Odra contracts.</li>
        </ul>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-bold mb-3">Roadmap</h2>
        <ol className="text-sm space-y-3">
          <RoadItem stage="Shipped" title="Casper Wallet + JSON-RPC broadcast" body="Real Testnet / Mainnet signing, live info_get_deploy polling with retries + timeouts, deploy receipt panel with explorer link." />
          <RoadItem stage="Shipped" title="x402 micropayments (native-transfer settlement)" body="Every agent action can settle via a small CSPR transfer to a configurable x402 recipient. Broadcast to Casper, receipt is the deploy hash." />
          <RoadItem stage="Shipped" title="Contracts & Config page" body="Per-network Odra contract hashes and x402 routing manageable from /settings/contracts, env-defaulted and stored locally." />
          <RoadItem stage="In progress" title="Odra attestation contracts on Testnet" body="Verus / Sentinel / Quorra / Yieldra will move from x402-payment attestations to real contract entry points (mint_attestation, revoke, record_vote, route_deposit)." />
          <RoadItem stage="Next" title="Backend x402 orchestration (Lovable Cloud)" body="Move MCP-served resource pricing + settlement into server functions so agents can pay upstream services independently." />
          <RoadItem stage="Next" title="Deploy cost preview + gas simulation" body="Pre-sign estimation via speculative_exec so users see cost before approving in Casper Wallet." />
          <RoadItem stage="Later" title="Multi-sig + agent-key delegation" body="Delegate scoped signing authority to agents with policy limits enforced on-chain." />
        </ol>
      </div>
    </div>

  );
}

function Block({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h2 className="font-bold mb-2">{title}</h2>
      <pre className="text-xs bg-input p-4 rounded-md overflow-x-auto border border-border">{children}</pre>
    </div>
  );
}

function RoadItem({ stage, title, body }: { stage: "Shipped" | "In progress" | "Next" | "Later"; title: string; body: string }) {
  const color =
    stage === "Shipped" ? "bg-success/15 text-success" :
    stage === "In progress" ? "bg-warning/15 text-warning" :
    stage === "Next" ? "bg-primary/15 text-primary" :
    "bg-muted text-muted-foreground";
  return (
    <li className="flex gap-3 items-start">
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap ${color}`}>{stage.toUpperCase()}</span>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{body}</div>
      </div>
    </li>
  );
}

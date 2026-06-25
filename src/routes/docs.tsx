import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Developer Docs — CasperCrew" },
      { name: "description", content: "Build on CasperCrew: MCP tool calls, x402 micropayments, CSPR.click signing, CSPR.cloud reads and Odra contract scaffolding." },
      { property: "og:title", content: "Developer Docs — CasperCrew" },
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
        <p className="text-muted-foreground">Plug into the CasperCrew agent platform. Examples below use the Casper AI Toolkit primitives.</p>
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

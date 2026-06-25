export const AGENTS = [
  { id: "yield", name: "Yieldra", role: "Autonomous Yield Router", emoji: "🌊", color: "#4fd1c5", desc: "Hunts the best CSPR DeFi yields with risk-aware routing." },
  { id: "rwa", name: "Verus", role: "RWA Oracle", emoji: "🛡️", color: "#f6ad55", desc: "Brings verified off-chain real-world data on-chain." },
  { id: "dao", name: "Quorra", role: "DAO Coordinator", emoji: "🗳️", color: "#9f7aea", desc: "Orchestrates multi-agent governance and execution." },
  { id: "compliance", name: "Sentinel", role: "Compliance & KYC", emoji: "🔐", color: "#63b3ed", desc: "Privacy-preserving compliance via ZK attestations." },
  { id: "treasury", name: "Vaulta", role: "Treasury Guardian", emoji: "🏛️", color: "#f687b3", desc: "Monitors and rebalances DAO treasuries autonomously." },
  { id: "builder", name: "Forge", role: "Odra Smart Contract Builder", emoji: "⚒️", color: "#fbd38d", desc: "Generates Odra-framework contracts from intents." },
] as const;

export const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Netherlands",
  "Switzerland", "Singapore", "Japan", "South Korea", "Australia", "India",
  "Brazil", "United Arab Emirates", "Other",
];
export const RESTRICTED = ["North Korea", "Iran", "Syria", "Cuba"];

export const YIELD_OPPS = [
  { protocol: "CasperSwap LP", apy: 14.2, risk: "Low", liquidity: "$8.4M", confidence: 0.92 },
  { protocol: "CSPR Lending", apy: 9.8, risk: "Low", liquidity: "$22.1M", confidence: 0.96 },
  { protocol: "RWA-Bond Pool", apy: 18.6, risk: "Medium", liquidity: "$3.2M", confidence: 0.81 },
  { protocol: "DeltaNeutral Vault", apy: 23.1, risk: "Medium", liquidity: "$1.9M", confidence: 0.74 },
  { protocol: "Restaking Validator", apy: 11.4, risk: "Low", liquidity: "$41.0M", confidence: 0.94 },
];

export const TXS = [
  { hash: "0x9af2…c41b", action: "Yield route 2,400 CSPR → CasperSwap LP", agent: "Yieldra", status: "Confirmed", time: "2m ago" },
  { hash: "0x71be…aa02", action: "RWA price feed: Brent crude $84.21", agent: "Verus", status: "Confirmed", time: "5m ago" },
  { hash: "0x3c80…91ee", action: "DAO proposal #214 risk review", agent: "Quorra", status: "Pending", time: "8m ago" },
  { hash: "0xdd11…7720", action: "KYC token issued (zk-attestation)", agent: "Sentinel", status: "Confirmed", time: "11m ago" },
  { hash: "0x55a9…3210", action: "Treasury rebalance: +3% stables", agent: "Vaulta", status: "Confirmed", time: "22m ago" },
];

export const MICROPAYMENTS = [
  { to: "MCP: balance-query", amount: 0.0021, unit: "CSPR", count: 142 },
  { to: "MCP: price-feed", amount: 0.0015, unit: "CSPR", count: 98 },
  { to: "CSPR.cloud: tx-history", amount: 0.0042, unit: "CSPR", count: 31 },
  { to: "RWA-data: bloomberg-proxy", amount: 0.012, unit: "CSPR", count: 12 },
];

export const ALERTS = [
  { level: "info", msg: "Yieldra rebalanced position +1.2%", time: "1m" },
  { level: "warn", msg: "RWA feed deviation > 0.5% — Verus paused source", time: "14m" },
  { level: "success", msg: "Quorra: proposal #213 executed on-chain", time: "1h" },
  { level: "info", msg: "Sentinel issued 4 KYC attestations", time: "2h" },
];

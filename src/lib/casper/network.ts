export type NetworkId = "casper-test" | "casper";

export interface NetworkConfig {
  id: NetworkId;
  label: string;
  chainName: NetworkId;
  rpc: string;
  explorer: string;
  faucet?: string;
}

const env = import.meta.env as Record<string, string | undefined>;

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  "casper-test": {
    id: "casper-test",
    label: "Testnet",
    chainName: "casper-test",
    rpc: env.VITE_CASPER_TESTNET_RPC ?? "https://node.testnet.cspr.cloud/rpc",
    explorer: env.VITE_CASPER_TESTNET_EXPLORER ?? "https://testnet.cspr.live",
    faucet: "https://testnet.cspr.live/tools/faucet",
  },
  casper: {
    id: "casper",
    label: "Mainnet",
    chainName: "casper",
    rpc: env.VITE_CASPER_MAINNET_RPC ?? "https://node.cspr.cloud/rpc",
    explorer: env.VITE_CASPER_MAINNET_EXPLORER ?? "https://cspr.live",
  },
};

export const DEFAULT_NETWORK: NetworkId = "casper-test";
export const STORAGE_KEY = "multitude:network";

export function explorerDeployUrl(net: NetworkConfig, hash: string) {
  return `${net.explorer}/deploy/${hash}`;
}
export function explorerAccountUrl(net: NetworkConfig, publicKey: string) {
  return `${net.explorer}/account/${publicKey}`;
}

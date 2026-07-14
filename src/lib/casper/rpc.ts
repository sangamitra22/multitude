import { HttpHandler, RpcClient, PurseIdentifier, PublicKey, Deploy } from "casper-js-sdk";
import type { NetworkConfig } from "./network";

function client(net: NetworkConfig) {
  return new RpcClient(new HttpHandler(net.rpc, "fetch"));
}

export async function fetchBalance(net: NetworkConfig, publicKeyHex: string): Promise<string> {
  const c = client(net);
  const pk = PublicKey.fromHex(publicKeyHex);
  const res = await c.queryLatestBalance(PurseIdentifier.fromPublicKey(pk));
  const motes = BigInt(res.balance.toString());
  const cspr = Number(motes) / 1_000_000_000;
  return cspr.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export async function putDeployRaw(net: NetworkConfig, deployJson: object): Promise<string> {
  const deploy = Deploy.fromJSON({ deploy: deployJson });
  const c = client(net);
  const res = await c.putDeploy(deploy);
  return String(res.deployHash);
}

export type DeployPhase = "signed" | "broadcasting" | "executed" | "finalized" | "failed";

export interface DeployStatus {
  phase: DeployPhase;
  blockHash?: string;
  errorMessage?: string;
}

export async function pollDeploy(
  net: NetworkConfig,
  hash: string,
  onUpdate: (s: DeployStatus) => void,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<DeployStatus> {
  const interval = opts.intervalMs ?? 3000;
  const timeout = opts.timeoutMs ?? 120_000;
  const c = client(net);
  const start = Date.now();
  onUpdate({ phase: "broadcasting" });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() - start > timeout) {
      return { phase: "broadcasting" };
    }
    try {
      const res = await c.getDeploy(hash);
      const exec = res.executionInfo;
      if (exec) {
        const blockHash = exec.blockHash ? String(exec.blockHash) : undefined;
        const execResult = exec.executionResult;
        if (execResult) {
          const errorMessage = execResult.errorMessage;
          if (errorMessage) {
            const s: DeployStatus = { phase: "failed", blockHash, errorMessage };
            onUpdate(s);
            return s;
          }
          onUpdate({ phase: "executed", blockHash });
          const s: DeployStatus = { phase: "finalized", blockHash };
          onUpdate(s);
          return s;
        }
      }
    } catch {
      /* not yet propagated */
    }
    await new Promise((r) => setTimeout(r, interval));
  }
}

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

export type DeployPhase = "signed" | "broadcasting" | "executed" | "finalized" | "failed" | "timeout";

export interface DeployStatus {
  phase: DeployPhase;
  blockHash?: string;
  errorMessage?: string;
  retries?: number;
  elapsedMs?: number;
  lastRpcError?: string;
}

export interface DeployReceipt {
  hash: string;
  blockHash?: string;
  timestamp?: string;
  from?: string;
  gasCostMotes?: string;
  transfers?: string[];
  errorMessage?: string;
  raw: unknown;
}

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function pollDeploy(
  net: NetworkConfig,
  hash: string,
  onUpdate: (s: DeployStatus) => void,
  opts: PollOptions = {},
): Promise<DeployStatus> {
  const interval = opts.intervalMs ?? 3000;
  const timeout = opts.timeoutMs ?? 120_000;
  const c = client(net);
  const start = Date.now();
  let retries = 0;
  let lastRpcError: string | undefined;
  onUpdate({ phase: "broadcasting", retries, elapsedMs: 0 });

  while (true) {
    if (opts.signal?.aborted) {
      const s: DeployStatus = { phase: "failed", errorMessage: "Cancelled", retries, elapsedMs: Date.now() - start };
      onUpdate(s);
      return s;
    }
    if (Date.now() - start > timeout) {
      const s: DeployStatus = {
        phase: "timeout",
        errorMessage: `No confirmation after ${Math.round(timeout / 1000)}s. The deploy may still finalize — retry to keep polling.`,
        retries,
        elapsedMs: Date.now() - start,
        lastRpcError,
      };
      onUpdate(s);
      return s;
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
            const s: DeployStatus = { phase: "failed", blockHash, errorMessage, retries, elapsedMs: Date.now() - start };
            onUpdate(s);
            return s;
          }
          onUpdate({ phase: "executed", blockHash, retries, elapsedMs: Date.now() - start });
          const s: DeployStatus = { phase: "finalized", blockHash, retries, elapsedMs: Date.now() - start };
          onUpdate(s);
          return s;
        }
      }
      // Not yet: report progress heartbeat
      onUpdate({ phase: "broadcasting", retries, elapsedMs: Date.now() - start, lastRpcError });
    } catch (e) {
      lastRpcError = e instanceof Error ? e.message : String(e);
      retries += 1;
      onUpdate({ phase: "broadcasting", retries, elapsedMs: Date.now() - start, lastRpcError });
    }
    await sleep(interval);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchDeployReceipt(net: NetworkConfig, hash: string): Promise<DeployReceipt> {
  const c = client(net);
  const res = await c.getDeploy(hash);
  const exec = res.executionInfo;
  const anyRes = res as unknown as {
    deploy?: { header?: { timestamp?: string; account?: string }; hash?: string };
  };
  const exAny = exec as unknown as {
    executionResult?: {
      cost?: { toString?: () => string };
      transfers?: unknown[];
      errorMessage?: string;
    };
    blockHash?: string;
  } | undefined;
  const execResult = exAny?.executionResult;
  const transfersRaw = (execResult?.transfers ?? []) as unknown[];
  return {
    hash,
    blockHash: exAny?.blockHash ? String(exAny.blockHash) : undefined,
    timestamp: anyRes.deploy?.header?.timestamp,
    from: anyRes.deploy?.header?.account,
    gasCostMotes: execResult?.cost ? String(execResult.cost) : undefined,
    transfers: transfersRaw.map((t) => (typeof t === "string" ? t : JSON.stringify(t))),
    errorMessage: execResult?.errorMessage,
    raw: res,
  };
}

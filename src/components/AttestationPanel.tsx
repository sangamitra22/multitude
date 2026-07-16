import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCasperWallet } from "@/lib/casper/wallet";
import { agentContractHash, listAttestations, recordAttestation, subscribeAttestations, updateAttestation, type AttestationRecord } from "@/lib/casper/attestation";
import { getContractsConfig, type AgentKey, AGENT_LABELS } from "@/lib/casper/config";
import { buildTransferDeployJson } from "@/lib/casper/buildTransfer";
import { fetchDeployReceipt, pollDeploy, putDeployRaw } from "@/lib/casper/rpc";
import { explorerDeployUrl } from "@/lib/casper/network";

interface Props {
  agent: AgentKey;
  memoPrefix: string; // human label, encoded into transfer id
}

export function AttestationPanel({ agent, memoPrefix }: Props) {
  const { network, publicKey, status, signDeploy, connect, extensionAvailable } = useCasperWallet();
  const connected = status === "connected" && !!publicKey;
  const [records, setRecords] = useState<AttestationRecord[]>(() => listAttestations(network.id, agent));
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
  const pollingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const refresh = () => setRecords(listAttestations(network.id, agent));
    refresh();
    return subscribeAttestations(refresh);
  }, [network.id, agent]);

  const contract = agentContractHash(network.id, agent);
  const x402 = getContractsConfig(network.id).x402;
  const amountCspr = (Number(BigInt(x402.paymentMotes)) / 1_000_000_000).toString();

  // Re-poll a single pending attestation and mirror its status back into storage.
  const repollOne = useCallback((rec: AttestationRecord) => {
    if (!rec.deployHash || pollingRef.current.has(rec.id)) return;
    pollingRef.current.add(rec.id);
    pollDeploy(network, rec.deployHash, (u) => {
      if (u.phase === "finalized") updateAttestation(rec.id, { status: "finalized", blockHash: u.blockHash, errorMessage: undefined });
      else if (u.phase === "failed") updateAttestation(rec.id, { status: "failed", errorMessage: u.errorMessage });
      else if (u.phase === "timeout") updateAttestation(rec.id, { errorMessage: u.errorMessage }); // stays pending
    }, { timeoutMs: 60_000 })
      .catch(() => {})
      .finally(() => { pollingRef.current.delete(rec.id); });
  }, [network]);

  // Auto re-poll pending records on mount / network switch / new records arriving.
  useEffect(() => {
    const pendings = records.filter((r) => r.status === "pending" && r.deployHash && r.networkId === network.id);
    pendings.forEach(repollOne);
  }, [records, network.id, repollOne]);

  async function refreshAttestations() {
    setRefreshing(true);
    setFlash(null);
    try {
      const current = listAttestations(network.id, agent);
      // Force fresh receipts for anything not-failed with a hash.
      await Promise.all(current.filter((r) => !!r.deployHash).map(async (r) => {
        try {
          const receipt = await fetchDeployReceipt(network, r.deployHash);
          if (receipt.errorMessage) {
            updateAttestation(r.id, { status: "failed", errorMessage: receipt.errorMessage, blockHash: receipt.blockHash });
          } else if (receipt.blockHash) {
            updateAttestation(r.id, { status: "finalized", blockHash: receipt.blockHash, errorMessage: undefined });
          }
        } catch {
          // ignore per-record errors; individual polling will retry
        }
      }));
      setLastRefreshed(Date.now());
    } catch (e) {
      setFlash(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }


  async function attest() {
    if (!connected || !publicKey) {
      await connect();
      return;
    }
    if (!x402.recipientPublicKeyHex) {
      setFlash("Set an x402 recipient in Settings → Contracts before attesting.");
      return;
    }
    setFlash(null);
    setBusy(true);
    const id = crypto.randomUUID();
    const memo = `${memoPrefix}:${Date.now()}`;
    const partial: AttestationRecord = {
      id,
      networkId: network.id,
      agent,
      deployHash: "",
      amountCspr,
      memo,
      timestamp: new Date().toISOString(),
      contractHash: contract,
      status: "pending",
    };
    recordAttestation(partial);
    try {
      const deployJson = buildTransferDeployJson({
        fromPublicKeyHex: publicKey,
        toPublicKeyHex: x402.recipientPublicKeyHex,
        amountCspr,
        network,
      });
      const signatureHex = await signDeploy(deployJson);
      const j = deployJson as { approvals?: Array<{ signer: string; signature: string }>; hash?: string };
      const signed = { ...j, approvals: [...(j.approvals ?? []), { signer: publicKey, signature: signatureHex }] };
      const hash = await putDeployRaw(network, signed);
      updateAttestation(id, { deployHash: hash });
      pollDeploy(network, hash, (u) => {
        if (u.phase === "finalized") updateAttestation(id, { status: "finalized", blockHash: u.blockHash });
        else if (u.phase === "failed" || u.phase === "timeout")
          updateAttestation(id, { status: "failed", errorMessage: u.errorMessage });
      }).catch(() => {});
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Attestation failed";
      updateAttestation(id, { status: "failed", errorMessage: msg });
      setFlash(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs text-primary font-mono mb-1">ON-CHAIN ATTESTATION · {network.label}</div>
          <h3 className="font-bold">{AGENT_LABELS[agent]} contract status</h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${contract ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
          {contract ? "CONTRACT CONFIGURED" : "NOT DEPLOYED — X402 ATTESTATION MODE"}
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <Info label="Contract hash" value={contract ? short(contract) : "—"} />
        <Info label="x402 recipient" value={x402.recipientPublicKeyHex ? short(x402.recipientPublicKeyHex) : <Link to="/settings/contracts" className="text-primary hover:underline">configure →</Link>} />
        <Info label="Payment per call" value={`${amountCspr} CSPR`} />
        <Info label="Attestations (local)" value={String(records.length)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={attest}
          disabled={busy || !extensionAvailable}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Signing…" : connected ? `Attest via x402 (${amountCspr} CSPR)` : "Connect wallet to attest"}
        </button>
        <Link to="/settings/contracts" className="text-xs text-primary hover:underline">Settings → Contracts</Link>
        {flash && <span className="text-xs text-destructive">{flash}</span>}
      </div>

      {records.length > 0 && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recent attestations</div>
          <ul className="space-y-1.5 text-xs">
            {records.slice(0, 5).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2 p-2 rounded bg-secondary/40">
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${r.status === "finalized" ? "bg-success/15 text-success" : r.status === "failed" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>{r.status}</span>
                <span className="font-mono">{r.deployHash ? short(r.deployHash) : "pending…"}</span>
                <span className="text-muted-foreground">{r.memo}</span>
                {r.deployHash && (
                  <a href={explorerDeployUrl(network, r.deployHash)} target="_blank" rel="noreferrer" className="text-primary hover:underline ml-auto">
                    Explorer →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-2.5 rounded bg-secondary/40">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono">{value}</div>
    </div>
  );
}

function short(h: string) {
  if (!h) return "";
  if (h.length <= 16) return h;
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

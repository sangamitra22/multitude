import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NETWORKS, DEFAULT_NETWORK, STORAGE_KEY, type NetworkId, type NetworkConfig } from "./network";

// Casper Wallet browser extension provider shape (subset we use).
// Docs: https://docs.casperwallet.io/dev-guide/
interface CasperWalletProvider {
  requestConnection: () => Promise<boolean>;
  disconnectFromSite: () => Promise<boolean>;
  isConnected: () => Promise<boolean>;
  getActivePublicKey: () => Promise<string>;
  sign: (deployJson: string, signingPublicKey: string) => Promise<{ cancelled: boolean; signatureHex?: string; signature?: Uint8Array }>;
  switchAccount: () => Promise<boolean>;
}

declare global {
  interface Window {
    CasperWalletProvider?: () => CasperWalletProvider;
    CasperWalletEventTypes?: Record<string, string>;
  }
}

export type WalletStatus = "idle" | "connecting" | "connected" | "unavailable";

interface CasperWalletContextValue {
  status: WalletStatus;
  publicKey: string | null;
  network: NetworkConfig;
  setNetwork: (id: NetworkId) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signDeploy: (deployJson: object) => Promise<string>;
  extensionAvailable: boolean;
  error: string | null;
}

const Ctx = createContext<CasperWalletContextValue | null>(null);

function readStoredNetwork(): NetworkId {
  if (typeof window === "undefined") return DEFAULT_NETWORK;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "casper" || v === "casper-test" ? v : DEFAULT_NETWORK;
}

export function CasperWalletProvider({ children }: { children: ReactNode }) {
  const [networkId, setNetworkId] = useState<NetworkId>(DEFAULT_NETWORK);
  const [status, setStatus] = useState<WalletStatus>("idle");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<CasperWalletProvider | null>(null);

  // Hydrate from localStorage + detect extension
  useEffect(() => {
    setNetworkId(readStoredNetwork());
    let tries = 0;
    const detect = () => {
      if (typeof window === "undefined") return;
      if (window.CasperWalletProvider) {
        setExtensionAvailable(true);
        providerRef.current = window.CasperWalletProvider();
        // Best-effort silent reconnect
        providerRef.current
          .isConnected()
          .then(async (c) => {
            if (c && providerRef.current) {
              try {
                const pk = await providerRef.current.getActivePublicKey();
                setPublicKey(pk);
                setStatus("connected");
              } catch {
                /* not unlocked */
              }
            }
          })
          .catch(() => {});
        return true;
      }
      return false;
    };
    if (detect()) return;
    const iv = window.setInterval(() => {
      tries += 1;
      if (detect() || tries > 20) window.clearInterval(iv);
    }, 250);
    return () => window.clearInterval(iv);
  }, []);

  // Wallet events
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onActiveKey = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      try {
        const parsed = typeof detail === "string" ? JSON.parse(detail) : detail;
        if (parsed?.activeKey) {
          setPublicKey(parsed.activeKey);
          setStatus("connected");
        } else if (parsed?.isConnected === false) {
          setPublicKey(null);
          setStatus("idle");
        }
      } catch {
        /* ignore */
      }
    };
    const onDisconnected = () => {
      setPublicKey(null);
      setStatus("idle");
    };
    const eventNames = [
      "casper-wallet:activeKeyChanged",
      "casper-wallet:connected",
      "casper-wallet:disconnected",
      "casper-wallet:locked",
      "casper-wallet:unlocked",
    ];
    eventNames.forEach((n) => window.addEventListener(n, onActiveKey));
    window.addEventListener("casper-wallet:disconnected", onDisconnected);
    return () => {
      eventNames.forEach((n) => window.removeEventListener(n, onActiveKey));
      window.removeEventListener("casper-wallet:disconnected", onDisconnected);
    };
  }, []);

  const setNetwork = (id: NetworkId) => {
    setNetworkId(id);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, id);
  };

  const connect = async () => {
    setError(null);
    if (!providerRef.current) {
      setError("Casper Wallet extension not detected. Install it from casperwallet.io.");
      setStatus("unavailable");
      return;
    }
    setStatus("connecting");
    try {
      const ok = await providerRef.current.requestConnection();
      if (!ok) {
        setStatus("idle");
        return;
      }
      const pk = await providerRef.current.getActivePublicKey();
      setPublicKey(pk);
      setStatus("connected");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
      setStatus("idle");
    }
  };

  const disconnect = async () => {
    try {
      await providerRef.current?.disconnectFromSite();
    } catch {
      /* ignore */
    }
    setPublicKey(null);
    setStatus("idle");
  };

  const signDeploy = async (deployJson: object): Promise<string> => {
    if (!providerRef.current || !publicKey) throw new Error("Wallet not connected");
    const res = await providerRef.current.sign(JSON.stringify(deployJson), publicKey);
    if (res.cancelled) throw new Error("Signature cancelled by user");
    if (!res.signatureHex) throw new Error("Wallet did not return a signature");
    return res.signatureHex;
  };

  const value = useMemo<CasperWalletContextValue>(
    () => ({
      status,
      publicKey,
      network: NETWORKS[networkId],
      setNetwork,
      connect,
      disconnect,
      signDeploy,
      extensionAvailable,
      error,
    }),
    [status, publicKey, networkId, extensionAvailable, error],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCasperWallet() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCasperWallet must be used inside <CasperWalletProvider>");
  return v;
}

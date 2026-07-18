import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { runPreflight, type PreflightResult } from "@/lib/preflight";

const DISMISS_KEY = "multitude:preflight-warnings-dismissed";

export function PreflightGate({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<PreflightResult | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setResult(runPreflight());
    try {
      if (typeof window !== "undefined" && window.sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
    const onChange = () => setResult(runPreflight());
    if (typeof window !== "undefined") {
      window.addEventListener("multitude:contracts-changed", onChange);
      return () => window.removeEventListener("multitude:contracts-changed", onChange);
    }
  }, []);

  if (!result) return <>{children}</>;

  if (!result.ok) {
    const errors = result.issues.filter((i) => i.severity === "error");
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-4 py-10">
        <div className="max-w-2xl w-full glass-card p-8 space-y-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-destructive font-semibold">Startup preflight failed</div>
            <h1 className="text-2xl font-bold mt-1">Multitude can't start with this configuration</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {errors.length} configuration {errors.length === 1 ? "error" : "errors"} were detected in your environment variables or saved contract settings. Fix them and reload.
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {errors.map((e, i) => (
              <li key={i} className="p-3 rounded-lg border border-destructive/40 bg-destructive/5">
                <div className="font-mono text-[11px] text-destructive">{e.scope} · {e.field}</div>
                <div className="mt-1">{e.message}</div>
                {e.fix && <div className="mt-1 text-xs text-muted-foreground">{e.fix}</div>}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link to="/settings/contracts" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Open Contracts & Config</Link>
            <button onClick={() => setResult(runPreflight())} className="px-4 py-2 rounded-md border border-border text-sm hover:bg-secondary">Re-run preflight</button>
          </div>
          <p className="text-[11px] text-muted-foreground pt-2">
            Preflight validates RPC/explorer URLs, Odra contract hashes, and x402 routing per network. See the README for the full env-var matrix.
          </p>
        </div>
      </div>
    );
  }

  const warnings = result.issues.filter((i) => i.severity === "warning");

  return (
    <>
      {warnings.length > 0 && !dismissed && (
        <div className="bg-warning/10 border-b border-warning/30 text-xs">
          <div className="max-w-7xl mx-auto px-6 py-2 flex flex-wrap items-center gap-3">
            <span className="font-semibold text-warning">Preflight · {warnings.length} warning{warnings.length === 1 ? "" : "s"}</span>
            <span className="text-muted-foreground truncate">
              {warnings.slice(0, 2).map((w) => w.message).join(" · ")}
              {warnings.length > 2 ? ` · +${warnings.length - 2} more` : ""}
            </span>
            <div className="flex-1" />
            <Link to="/settings/contracts" className="text-primary hover:underline">Review settings</Link>
            <button
              onClick={() => {
                setDismissed(true);
                try { window.sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
              }}
              className="text-muted-foreground hover:text-foreground"
            >Dismiss</button>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

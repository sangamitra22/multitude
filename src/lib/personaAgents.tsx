import { Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth, PERSONA_LABELS, type Persona } from "@/lib/auth";

export type AgentId = "yield" | "rwa" | "dao" | "compliance";

// Which agents each persona is allowed to open. Developer/Builder sees everything.
export const PERSONA_AGENTS: Record<Persona, AgentId[]> = {
  "defi-investor": ["yield"],
  "rwa-operator": ["rwa"],
  "dao-manager": ["dao", "compliance"],
  "compliance-officer": ["compliance"],
  developer: ["yield", "rwa", "dao", "compliance"],
};

const AGENT_LABEL: Record<AgentId, string> = {
  yield: "Yieldra · Yield Router",
  rwa: "Verus · RWA Oracle",
  dao: "Quorra · DAO Coordinator",
  compliance: "Sentinel · Compliance",
};

const AGENT_PATH: Record<AgentId, "/agents/yield" | "/agents/rwa" | "/agents/dao" | "/agents/compliance"> = {
  yield: "/agents/yield",
  rwa: "/agents/rwa",
  dao: "/agents/dao",
  compliance: "/agents/compliance",
};

export function AgentGate({ agent, children }: { agent: AgentId; children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Sign in required</h1>
        <p className="text-muted-foreground mb-6">Log in to access Multitude agent workflows.</p>
        <Link to="/login" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold">Go to login</Link>
      </div>
    );
  }

  const allowed = PERSONA_AGENTS[user.persona] ?? [];
  if (!allowed.includes(agent)) {
    return <RedirectToNearestAgent requested={agent} allowed={allowed} persona={user.persona} />;
  }

  return <>{children}</>;
}

// Sends the user to the closest persona-allowed agent with a brief notice.
function RedirectToNearestAgent({
  requested, allowed, persona,
}: { requested: AgentId; allowed: AgentId[]; persona: Persona }) {
  const target = allowed[0];
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!target) return;
    const t = setTimeout(() => setGo(true), 1400);
    return () => clearTimeout(t);
  }, [target]);

  if (go && target) return <Navigate to={AGENT_PATH[target]} replace />;

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      <div className="glass-card p-8 text-center space-y-3">
        <div className="text-4xl">↪️</div>
        <h1 className="text-xl font-bold">Redirecting you to your crew</h1>
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{AGENT_LABEL[requested]}</span> isn’t part of the{" "}
          <span className="text-foreground font-semibold">{PERSONA_LABELS[persona]}</span> persona.
          {target ? <> Taking you to <span className="text-primary font-semibold">{AGENT_LABEL[target]}</span>…</> : " No agent is available for this persona."}
        </p>
        {target && (
          <Link to={AGENT_PATH[target]} className="inline-block mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
            Go now →
          </Link>
        )}
        <div><Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">Cancel, back to dashboard</Link></div>
      </div>
    </div>
  );
}

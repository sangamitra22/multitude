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
    return (
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="glass-card p-8 text-center space-y-4">
          <div className="text-5xl">🔒</div>
          <h1 className="text-2xl font-bold">Agent locked for your persona</h1>
          <p className="text-muted-foreground">
            You signed in as <span className="text-foreground font-semibold">{PERSONA_LABELS[user.persona]}</span>.
            The <span className="text-foreground font-semibold">{AGENT_LABEL[agent]}</span> workflow isn’t part of your crew.
          </p>
          <div className="pt-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Available to you</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {allowed.length === 0 ? (
                <span className="text-sm text-muted-foreground">No agents available — contact admin.</span>
              ) : (
                allowed.map((a) => (
                  <Link
                    key={a}
                    to={AGENT_PATH[a]}
                    className="px-3 py-1.5 rounded-md bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition"
                  >
                    {AGENT_LABEL[a]} →
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="pt-2">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

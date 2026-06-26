import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Persona =
  | "defi-investor"
  | "rwa-operator"
  | "dao-manager"
  | "compliance-officer"
  | "developer";

export interface User {
  name: string;
  email: string;
  country: string;
  age: number;
  persona: Persona;
}

interface AuthCtx {
  user: User | null;
  signup: (u: User & { password: string }) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setPersona: (p: Persona) => void;
}


const Ctx = createContext<AuthCtx | null>(null);
const KEY = "caspercrew.session";
const DB = "caspercrew.users";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const signup: AuthCtx["signup"] = (u) => {
    const users = JSON.parse(localStorage.getItem(DB) || "{}");
    users[u.email.toLowerCase()] = u;
    localStorage.setItem(DB, JSON.stringify(users));
    const { password: _p, ...rest } = u;
    void _p;
    localStorage.setItem(KEY, JSON.stringify(rest));
    setUser(rest);
  };

  const login: AuthCtx["login"] = (email, password) => {
    const users = JSON.parse(localStorage.getItem(DB) || "{}");
    const found = users[email.toLowerCase()];
    if (!found || found.password !== password) return false;
    const { password: _p, ...rest } = found;
    void _p;
    localStorage.setItem(KEY, JSON.stringify(rest));
    setUser(rest);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  const setPersona: AuthCtx["setPersona"] = (p) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, persona: p };
      localStorage.setItem(KEY, JSON.stringify(next));
      const users = JSON.parse(localStorage.getItem(DB) || "{}");
      const key = prev.email.toLowerCase();
      if (users[key]) {
        users[key] = { ...users[key], persona: p };
        localStorage.setItem(DB, JSON.stringify(users));
      }
      return next;
    });
  };

  return <Ctx.Provider value={{ user, signup, login, logout, setPersona }}>{children}</Ctx.Provider>;
}


export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}

export const PERSONA_LABELS: Record<Persona, string> = {
  "defi-investor": "DeFi Investor",
  "rwa-operator": "RWA Operator",
  "dao-manager": "DAO Manager",
  "compliance-officer": "Compliance Officer",
  developer: "Developer / Builder",
};

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAuth, PERSONA_LABELS, type Persona } from "@/lib/auth";
import { COUNTRIES, RESTRICTED } from "@/lib/mockData";

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>) => ({
    persona: (s.persona as Persona) ?? undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign up — Multitude" },
      { name: "description", content: "Create your Multitude prototype account and deploy your agent crew." },
      { property: "og:title", content: "Sign up — Multitude" },
      { property: "og:url", content: "/signup" },
    ],
    links: [{ rel: "canonical", href: "/signup" }],
  }),
  component: SignUp,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Invalid email").max(200),
  password: z.string().min(8, "Min 8 characters").max(200),
  country: z.string().min(1, "Select a country"),
  age: z.coerce.number().int().min(18, "You must be 18+").max(120),
  persona: z.enum(["defi-investor", "rwa-operator", "dao-manager", "compliance-officer", "developer"]),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  compliance: z.literal(true, { errorMap: () => ({ message: "You must acknowledge compliance" }) }),
});

function SignUp() {
  const { persona } = Route.useSearch();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);
  const [restricted, setRestricted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const f = new FormData(e.currentTarget);
    const data = {
      name: f.get("name"),
      email: f.get("email"),
      password: f.get("password"),
      country: f.get("country"),
      age: f.get("age"),
      persona: f.get("persona"),
      terms: f.get("terms") === "on",
      compliance: f.get("compliance") === "on",
    };
    if (RESTRICTED.includes(String(data.country))) {
      setRestricted(true);
      return;
    }
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    signup({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      country: parsed.data.country,
      age: parsed.data.age,
      persona: parsed.data.persona as Persona,
    });
    navigate({ to: "/dashboard" });
  }

  if (restricted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-bold mb-3">Access restricted</h1>
        <p className="text-muted-foreground">Multitude is not available in your selected jurisdiction. This prototype enforces a basic sanctions/jurisdiction screen.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Join the Crew</h1>
      <p className="text-muted-foreground mb-8">Mock signup — credentials are stored locally in your browser for this prototype.</p>
      <form onSubmit={onSubmit} className="glass-card p-6 space-y-4">
        <Field label="Name"><input name="name" required className={input} placeholder="Ada Lovelace" /></Field>
        <Field label="Email"><input name="email" type="email" required className={input} placeholder="you@example.com" /></Field>
        <Field label="Password"><input name="password" type="password" required minLength={8} className={input} placeholder="Min 8 characters" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Country">
            <select name="country" required defaultValue="" className={input}>
              <option value="" disabled>Select…</option>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Age"><input name="age" type="number" min={18} required className={input} placeholder="18+" /></Field>
        </div>
        <Field label="Persona">
          <select name="persona" required defaultValue={persona ?? ""} className={input}>
            <option value="" disabled>Select…</option>
            {Object.entries(PERSONA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <label className="flex gap-2 items-start text-sm">
          <input type="checkbox" name="terms" className="mt-1" />
          <span>I accept the Terms of Use and acknowledge this is a prototype — not financial, legal, or investment advice.</span>
        </label>
        <label className="flex gap-2 items-start text-sm">
          <input type="checkbox" name="compliance" className="mt-1" />
          <span>I acknowledge responsible-AI and blockchain risk disclaimers, and that I am not located in a restricted jurisdiction.</span>
        </label>
        {err && <div className="text-sm text-destructive">{err}</div>}
        <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">Create account</button>
      </form>
    </div>
  );
}

const input = "w-full px-3 py-2 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}

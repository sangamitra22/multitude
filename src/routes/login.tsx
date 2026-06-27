import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Multitude" },
      { name: "description", content: "Sign in to your Multitude prototype workspace." },
      { property: "og:title", content: "Login — Multitude" },
      { property: "og:url", content: "/login" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ok = login(String(f.get("email")), String(f.get("password")));
    if (!ok) { setErr("Invalid email or password. (This prototype stores accounts locally — sign up first.)"); return; }
    nav({ to: "/dashboard" });
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
      <p className="text-muted-foreground mb-8">Sign in to your crew.</p>
      <form onSubmit={onSubmit} className="glass-card p-6 space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">Email</span>
          <input name="email" type="email" required className="w-full px-3 py-2 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">Password</span>
          <input name="password" type="password" required className="w-full px-3 py-2 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
        </label>
        {err && <div className="text-sm text-destructive">{err}</div>}
        <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">Sign in</button>
        <div className="text-sm text-muted-foreground text-center">
          No account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </div>
      </form>
    </div>
  );
}

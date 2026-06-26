import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function GhostLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="animate-ghost" aria-hidden>
      <defs>
        <linearGradient id="gh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.95 0.05 195)" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 220)" />
        </linearGradient>
      </defs>
      <path
        d="M32 4c-12 0-22 9-22 21v32c0 2 2 3 4 2l6-4 6 4c1 .8 3 .8 4 0l6-4 6 4c1 .8 3 .8 4 0l6-4 6 4c2 1 4 0 4-2V25C54 13 44 4 32 4z"
        fill="url(#gh)"
      />
      <circle cx="24" cy="26" r="3.5" fill="#101426" />
      <circle cx="40" cy="26" r="3.5" fill="#101426" />
      <path d="M26 38c2 3 10 3 12 0" stroke="#101426" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <GhostLogo />
          <span className="glow-text">CasperCrew</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Dashboard</Link>
              <Link to="/wallet" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Wallet</Link>
              <Link to="/agents/yield" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Agents</Link>
            </>
          ) : (
            <>
              <Link to="/personas" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Personas</Link>
              <Link to="/architecture" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Architecture</Link>
              <Link to="/docs" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Docs</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:inline text-xs text-muted-foreground">{user.name}</span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-secondary transition"
              >Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 text-sm rounded-md hover:bg-secondary transition">Login</Link>
              <Link to="/signup" className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 font-bold mb-2"><GhostLogo size={22} /> CasperCrew</div>
          <p className="text-muted-foreground">Your friendly crew of autonomous AI agents for the Casper economy.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Product</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link to="/personas" className="hover:text-foreground">Personas</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/agents/yield" className="hover:text-foreground">Workflows</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Developers</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link to="/docs" className="hover:text-foreground">Documentation</Link></li>
            <li><Link to="/architecture" className="hover:text-foreground">Architecture</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Disclaimer</div>
          <p className="text-xs text-muted-foreground">
            CasperCrew is a hackathon prototype. Not financial, legal, or investment advice.
            Mock data shown throughout. AI agents and blockchain actions carry inherent risks.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CasperCrew · Built for the Casper Agentic Buildathon
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PERSONA_AGENTS } from "@/lib/personaAgents";


export function BrandMark({ size = 28 }: { size?: number }) {
  // Multitude mark: a swarm of agent nodes connected as a mesh.
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="animate-ghost">
      <defs>
        <radialGradient id="mNode" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.98 0.06 195)" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 220)" />
        </radialGradient>
        <linearGradient id="mLink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.85 0.1 195 / 0.7)" />
          <stop offset="100%" stopColor="oklch(0.7 0.18 290 / 0.5)" />
        </linearGradient>
      </defs>
      <g stroke="url(#mLink)" strokeWidth="1.2" fill="none">
        <path d="M14 20 L32 12 L50 22 L44 44 L20 46 Z" />
        <path d="M32 12 L44 44 M14 20 L50 22 M20 46 L50 22 M32 32 L14 20 M32 32 L50 22 M32 32 L44 44 M32 32 L20 46 M32 32 L32 12" />
      </g>
      {([[14,20,3.5],[32,12,4.5],[50,22,3.5],[44,44,4],[20,46,3.5],[32,32,5.5]] as const).map(([x,y,r],i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="url(#mNode)" />
      ))}
    </svg>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <BrandMark />
          <span className="glow-text">Multitude</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {!user && <Link to="/" className="hover:text-foreground transition" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Home</Link>}
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Dashboard</Link>
              <Link to="/wallet" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Wallet</Link>
              {(() => {
                const first = PERSONA_AGENTS[user.persona]?.[0] ?? "yield";
                const path = first === "rwa" ? "/agents/rwa" : first === "dao" ? "/agents/dao" : first === "compliance" ? "/agents/compliance" : "/agents/yield";
                return <Link to={path} className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Agents</Link>;
              })()}
              <Link to="/settings/contracts" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Settings</Link>
              <Link to="/demo" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Judge Demo</Link>
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
          <div className="flex items-center gap-2 font-bold mb-2"><BrandMark size={22} /> Multitude</div>
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
            Multitude is a hackathon prototype. Not financial, legal, or investment advice.
            Mock data shown throughout. AI agents and blockchain actions carry inherent risks.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Multitude · Built for the Casper Agentic Buildathon
      </div>
    </footer>
  );
}

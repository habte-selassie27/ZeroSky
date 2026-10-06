import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { CloudRain, ExternalLink, Menu, X } from "lucide-react";
import { WalletPanel } from "./wallet-panel";
import { ThemeToggle } from "./theme-toggle";
import { CONTRACT_ADDRESS, explorerAddressUrl } from "@/lib/genlayer/config";

const NAV_ITEMS = [
  { to: "/policies", label: "The Ledger" },
  { to: "/dashboard", label: "Your Tickets" },
];

type NavLinkState = { isActive: boolean };

function navLinkClass({ isActive }: NavLinkState) {
  return isActive ? "zs-nav-link is-active" : "zs-nav-link";
}

function mobileLinkClass({ isActive }: NavLinkState) {
  return isActive ? "zs-mobile-link is-active" : "zs-mobile-link";
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className={compact ? "zs-brand-mark zs-brand-mark--sm" : "zs-brand-mark"}>
        <CloudRain size={compact ? 16 : 20} aria-hidden />
      </span>
      <span className="leading-tight">
        <span className={`block font-semibold uppercase tracking-[0.2em] ${compact ? "text-sm" : "text-lg"}`}>
          ZeroSky
        </span>
        <span className="zs-tag block">Weather Claims Station</span>
      </span>
    </span>
  );
}

function ExplorerLink({ className }: { className?: string }) {
  if (!CONTRACT_ADDRESS) return null;
  return (
    <a className={className} href={explorerAddressUrl(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer">
      View contract on the StudioNet explorer
      <ExternalLink size={13} aria-hidden />
    </a>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen zs-isobars">
      <header className={stuck ? "zs-header is-stuck" : "zs-header"}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="shrink-0" aria-label="ZeroSky home" onClick={closeMenu}>
            <Brand />
          </Link>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
            <div className="zs-nav-pill">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <Link className="zs-nav-cta" to="/policies/new">
              Request a Quote
            </Link>
            <span className="zs-header-divider" aria-hidden />
            <ThemeToggle />
            <WalletPanel />
          </nav>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="zs-icon-btn"
              aria-expanded={menuOpen}
              aria-controls="zs-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div id="zs-mobile-nav" className="zs-mobile-panel md:hidden">
            <nav className="zs-mobile-nav" aria-label="Primary mobile">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={mobileLinkClass} onClick={closeMenu}>
                  {item.label}
                </NavLink>
              ))}
              <Link className="zs-nav-cta mt-2 w-full justify-center" to="/policies/new" onClick={closeMenu}>
                Request a Quote
              </Link>
            </nav>
            <div
              className="mt-3 flex items-center justify-between gap-3 border-t pt-3"
              style={{ borderColor: "hsl(var(--border) / 0.7)" }}
            >
              <span className="zs-tag">Identity</span>
              <WalletPanel />
            </div>
          </div>
        ) : null}
      </header>

      <main id="main">{children}</main>

      <footer className="border-t border-[hsl(var(--border)/0.7)]">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Brand compact />
              <p className="mt-5 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                ZeroSky is a GenLayer Intelligent Contract. The deployed contract is the sole source of truth for
                every quote, ticket, stake, reading, and payout, this site only reads and writes to it.
              </p>
              <ExplorerLink className="zs-footer-link mt-4 inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline" />
            </div>

            <div>
              <span className="zs-tag">Read</span>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link className="zs-footer-link" to="/policies">
                    The Ledger
                  </Link>
                </li>
                <li>
                  <Link className="zs-footer-link" to="/how-it-works">
                    Station manual
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <span className="zs-tag">Act</span>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link className="zs-footer-link" to="/policies/new">
                    Request a Quote
                  </Link>
                </li>
                <li>
                  <Link className="zs-footer-link" to="/dashboard">
                    Your Tickets
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "hsl(var(--border) / 0.7)" }}
          >
            <span className="text-[hsl(var(--muted-foreground))]">
              © {new Date().getFullYear()} ZeroSky — read-only client, the contract settles everything.
            </span>
            <span className="zs-mono text-[hsl(var(--muted-foreground))]">GenLayer · StudioNet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

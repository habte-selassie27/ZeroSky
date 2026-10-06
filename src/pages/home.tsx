import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";

const readingLine: Array<{ n: string; title: string; body: string; kind: "det" | "nondet" }> = [
  { n: "01", title: "Request a quote", body: "Peril, location, a structured threshold, a coverage window, and how much payout you want, written straight to a quote record. No GEN moves yet.", kind: "det" },
  { n: "02", title: "Climatology round", body: "GenLayer validators independently fetch years of historical weather for the exact coordinates and window, and price how likely your condition is into a risk band.", kind: "nondet" },
  { n: "03", title: "Premium derived, not chosen", body: "LOW, MODERATE, or HIGH sets a fixed multiplier. The contract computes the exact premium your requested payout requires; you never pick a number yourself.", kind: "det" },
  { n: "04", title: "Premium → Cistern", body: "Buying the quote pays that exact premium. It leaves the holder's wallet and joins the shared pool. Arithmetic, not opinion.", kind: "det" },
  { n: "05", title: "Station gauge read", body: "Once coverage ends, validators independently fetch weather-station data for the exact coordinates and window.", kind: "nondet" },
  { n: "06", title: "Sky read", body: "A second, independent fetch, satellite or precipitation summary for the same location and dates.", kind: "nondet" },
  { n: "07", title: "Ground read", body: "A third fetch, local news and community reports that corroborate or contradict the instruments.", kind: "nondet" },
  { n: "08", title: "Consensus measurement", body: "gl.eq_principle.prompt_comparative normalizes both providers and reconciles disagreement into one canonical numeric value, or records insufficient evidence.", kind: "nondet" },
  { n: "09", title: "Exact trigger settlement", body: "The contract compares that value with the numeric threshold stored at purchase. A met trigger pays; insufficient evidence reopens for retry.", kind: "det" },
];

const whyHard: Array<[string, string]> = [
  ["One station isn't the field", "The nearest weather station can sit miles from the actual farm, close enough to look official, far enough to be wrong."],
  ["Sky and ground don't always agree", "Satellite precipitation estimates and station gauges routinely diverge on exactly the storms worth paying for."],
  ["The payer grading its own claim", "An insurer scoring its own payout has no structural reason to find in the holder's favor."],
  ["A free-text trigger prices nothing", "\"Any measurable rainfall\" is easy to write and easy to trigger. Without a structured condition and a priced likelihood, a loose trigger just drains everyone else's premiums."],
  ["Self-reports can be staged", "Photos and receipts submitted by the claimant alone are evidence of nothing but the claimant's story."],
  ["Nobody has weeks to wait", "A human adjuster driving out to inspect a field is a two-week decision for a payout that was due before harvest."],
];

const howItWorks: Array<[string, string]> = [
  ["Request a quote", "Any wallet can ask for a price on a peril, a location, a structured threshold, and a payout amount. GenLayer prices it before anyone pays anything."],
  ["Buy at the priced premium", "The quote comes back with a risk band and an exact required premium. Paying it is the only way to open a ticket, at the exact terms already quoted."],
  ["The clock runs, untouched", "Coverage sits ACTIVE. The deterministic gate that unlocks a reading simply hasn't opened yet, nothing to trust in the meantime."],
  ["Anyone pulls the reading", "Once the window closes, check_claim is permissionless. A keeper, a neighbor, or the holder themselves can call it."],
  ["Validators log what they found", "Consensus reconciles normalized readings into a canonical measurement; deterministic contract arithmetic then evaluates the stored trigger."],
  ["Static reopens, it doesn't close", "Conflicting or thin evidence logs as static. The ticket stays claimable; a cooldown, not a denial, stands between it and a retry."],
];

const stats = [
  { v: "3", l: "Independent evidence reads" },
  { v: "0", l: "Human adjusters" },
  { v: "GEN", l: "Cistern-funded payouts" },
  { v: "100%", l: "On-chain settlement" },
];

type SectionId = "overview" | "reading-line" | "why-trust" | "how-it-works";

const SECTIONS: Array<{ id: SectionId; tab: string; footer: string }> = [
  { id: "overview", tab: "Overview", footer: "Overview" },
  { id: "reading-line", tab: "The Reading Line", footer: "The Reading Line" },
  { id: "why-trust", tab: "Why claims are hard", footer: "Why claims are hard" },
  { id: "how-it-works", tab: "How ZeroSky works", footer: "How ZeroSky works" },
];

function isSection(value: string | null): value is SectionId {
  return SECTIONS.some((section) => section.id === value);
}

function Overview() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[hsl(var(--primary)/0.15)] blur-3xl" />
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-14 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--good))] zs-pulse" />
          Parametric weather cover, priced before you buy
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl bg-gradient-to-b from-[hsl(var(--foreground))] to-[hsl(var(--muted-foreground))] bg-clip-text text-5xl font-bold leading-[1.05] tracking-tight text-transparent md:text-6xl">
          The weather doesn&rsquo;t lie to a validator.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))] md:text-lg">
          ZeroSky is a GenLayer-native weather station for farms and outdoor businesses. GenLayer prices how
          likely your condition is from real historical weather before you pay anything, and pulls the weather
          itself when coverage ends. Nobody&rsquo;s word decides the payout but the reading.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/policies/new" className="zs-btn-primary rounded-full px-7 py-3.5 shadow-[0_12px_30px_-12px_hsl(var(--primary)/0.8)]">
            Request a Quote →
          </Link>
          <Link to="/policies" className="zs-btn-ghost rounded-full px-7 py-3.5">
            Read the Ledger
          </Link>
          <Link to="/dashboard" className="zs-btn-ghost rounded-full px-7 py-3.5">
            My Tickets
          </Link>
        </div>

        {/* Stat strip */}
        <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--border))] md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="bg-[hsl(var(--card)/0.85)] px-4 py-5">
              <dt className="order-2 mt-1 block text-[0.65rem] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">{s.l}</dt>
              <dd className="text-2xl font-bold tracking-tight">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function ReadingLine() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="zs-eyebrow">The reading line</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">What actually happens between a quote and a payout</h2>
        </div>
        <span className="zs-tag hidden shrink-0 sm:block">01 — 09</span>
      </div>
      <ol className="relative mt-12 space-y-6 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-[hsl(var(--border))] md:before:left-1/2">
        {readingLine.map((step, i) => (
          <li key={step.n} className={`relative flex md:items-center ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}>
            <span className="absolute left-4 top-6 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--primary))] md:left-1/2" />
            <div className="ml-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.7)] p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.4)] md:ml-0 md:w-[46%]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="zs-mono text-xs text-[hsl(var(--primary))]">{step.n}</span>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                </div>
                <span className={`zs-pill text-[0.6rem] ${step.kind === "nondet" ? "border-[hsl(var(--accent)/0.4)] text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                  {step.kind === "nondet" ? "CONSENSUS" : "DETERMINISTIC"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WhyTrust() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <p className="zs-eyebrow">Why weather claims are hard to trust</p>
      <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight md:text-3xl">A single feed was never going to settle this fairly</h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {whyHard.map(([title, body], i) => (
          <div
            className="group rounded-xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--background))] p-6 transition hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.4)] hover:shadow-[0_18px_40px_-24px_hsl(var(--accent)/0.5)]"
            key={title}
          >
            <span className="zs-mono text-xs text-[hsl(var(--accent))]">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-16 pt-14">
      <p className="zs-eyebrow">How ZeroSky works</p>
      <ol className="mt-8 divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)]">
        {howItWorks.map(([title, body], i) => (
          <li className="flex gap-5 p-5 transition hover:bg-[hsl(var(--muted)/0.3)]" key={title}>
            <span className="zs-step-number mt-0.5">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 text-center">
        <Link to="/how-it-works" className="inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--primary))] underline-offset-4 hover:underline">
          Read the full station manual →
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("s");
  const active: SectionId = isSection(requested) ? requested : "overview";
  const activeIndex = SECTIONS.findIndex((section) => section.id === active);
  const next = SECTIONS[activeIndex + 1] ?? null;

  const navRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef<SectionId | null>(null);

  // The strip is sticky, so a section change must re-anchor the viewport
  // underneath it instead of leaving the reader at the bottom of the old
  // section (e.g. after clicking a footer Sections link).
  useEffect(() => {
    const previous = shownRef.current;
    shownRef.current = active;
    if (previous === null || previous === active) return;
    const el = navRef.current;
    if (!el) return;
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--zs-header-h");
    const headerHeight = Number.parseFloat(raw) || 62;
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }, [active]);

  const select = (id: SectionId) => {
    if (id === active) return;
    const nextParams = new URLSearchParams(searchParams);
    if (id === "overview") nextParams.delete("s");
    else nextParams.set("s", id);
    setSearchParams(nextParams);
  };

  return (
    <div className="zs-isobars">
      <div className="zs-section-nav" ref={navRef}>
        <div className="zs-section-nav-scroll mx-auto max-w-5xl px-5">
          <div className="zs-nav-pill" role="tablist" aria-label="Home sections">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                role="tab"
                id={`zs-tab-${section.id}`}
                aria-controls={`zs-panel-${section.id}`}
                aria-selected={section.id === active}
                className={section.id === active ? "zs-nav-link is-active" : "zs-nav-link"}
                onClick={() => select(section.id)}
              >
                {section.tab}
              </button>
            ))}
          </div>
          <span className="zs-tag ml-auto hidden shrink-0 lg:block">
            Section {activeIndex + 1} / {SECTIONS.length}
          </span>
        </div>
      </div>

      <div
        key={active}
        role="tabpanel"
        id={`zs-panel-${active}`}
        aria-labelledby={`zs-tab-${active}`}
      >
        {active === "overview" ? <Overview /> : null}
        {active === "reading-line" ? <ReadingLine /> : null}
        {active === "why-trust" ? <WhyTrust /> : null}
        {active === "how-it-works" ? <HowItWorks /> : null}

        {next ? (
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 border-t border-[hsl(var(--border)/0.7)] px-5 py-6">
            <span className="zs-tag hidden sm:block">Next</span>
            <button
              type="button"
              className="zs-btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold"
              onClick={() => select(next.id)}
            >
              {next.tab} →
            </button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 border-t border-[hsl(var(--border)/0.7)] px-5 py-6">
            <span className="zs-tag hidden sm:block">End of the line</span>
            <Link to="/policies/new" className="zs-btn-primary rounded-full px-5 py-2.5 text-sm">
              Request a Quote →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

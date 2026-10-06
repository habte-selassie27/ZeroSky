import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 text-center">
      <span className="zs-tag">404</span>
      <h1 className="mt-3 text-3xl font-semibold">Nothing on file at that address</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">
        The station keeps every ticket ever opened, but this path doesn&rsquo;t match one of them or any
        page of the manual.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="zs-btn-primary px-5 py-3">
          Back to the station
        </Link>
        <Link to="/policies" className="zs-btn-ghost px-5 py-3">
          Read the Ledger
        </Link>
      </div>
    </div>
  );
}

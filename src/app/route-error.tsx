import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import NotFoundPage from "./not-found";

export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "The station couldn't answer that read.";

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 text-center">
      <span className="zs-tag">Read failed</span>
      <h1 className="mt-3 text-3xl font-semibold">The chain didn&rsquo;t answer</h1>
      <p className="mx-auto mt-4 max-w-xl break-words text-sm leading-7 text-[hsl(var(--muted-foreground))]">{message}</p>
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

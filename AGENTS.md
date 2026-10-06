# This is a Vite SPA, not Next.js

There is no server, no SSR, and no `src/app` router convention. Read this before adding a page
or touching routing.

- `index.html` is the document shell: `<title>`, meta description, favicon, and the pre-paint
  theme script live there, not in a `layout.tsx`.
- `src/main.tsx` mounts `src/routes.tsx`.
- `src/routes.tsx` is a React Router v7 data router (`createBrowserRouter`). Every route sets an
  `errorElement`; page data is fetched by route `loader`s, so `src/pages/*` are client
  components that read `useLoaderData()` instead of being async server components.
- `src/app/root-layout.tsx` is the shell (skip link, providers, `AppShell`, `<Outlet />`).

Porting rules when you find old Next.js code:

- `<Link href>` → `react-router`'s `<Link to>`; the prop is `to`, `href` does not exist.
- `useRouter()` from `next/navigation` → `useNavigate()` for `push`, `useRevalidator()`
  (`revalidate()`) for `refresh()`.
- `notFound()` → `throw new Response("Not Found", { status: 404 })` inside the route loader.
- `export const dynamic`, `"use client"`, `export const metadata`, and `next/font` have no
  equivalent — delete them. Fonts are self-hosted via `@fontsource-variable/geist*` in
  `src/main.tsx` and wired through `--font-geist-*` in `src/app/globals.css`.
- Env vars are `VITE_*` (see `src/lib/genlayer/config.ts`). `scripts/*.mjs` still accept the
  legacy `NEXT_PUBLIC_*` names as a fallback.

Verify with `npx tsc --noEmit`, `npx eslint`, and `npm run build`.

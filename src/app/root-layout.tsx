import { Outlet, ScrollRestoration, useNavigation } from "react-router";
import Providers from "./providers";
import { AppShell } from "@/components/app-shell";

export default function RootLayout() {
  const navigation = useNavigation();
  const pending = navigation.state !== "idle";

  return (
    <>
      <ScrollRestoration />
      {pending ? <div className="zs-progress" role="progressbar" aria-label="Loading" /> : null}
      <a href="#main" className="zs-skip-link">
        Skip to content
      </a>
      <Providers>
        <AppShell>
          <Outlet />
        </AppShell>
      </Providers>
    </>
  );
}

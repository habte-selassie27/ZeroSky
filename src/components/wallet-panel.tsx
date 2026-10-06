import { useEffect, useRef, useState } from "react";
import { LogOut, PlugZap, KeyRound } from "lucide-react";
import { useWallet } from "./wallet-provider";
import { shortenAddress } from "@/lib/format";

export function WalletPanel() {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function disconnect() {
    wallet.disconnect();
    setMessage("Disconnected.");
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        className="zs-wallet-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {wallet.mode === "none" ? (
          <>
            <KeyRound size={14} aria-hidden /> Connect wallet
          </>
        ) : (
          <>
            <span className="zs-wallet-dot" aria-hidden /> <span className="zs-mono">{shortenAddress(wallet.address)}</span>
          </>
        )}
      </button>
      {open ? (
        <div className="zs-station zs-popover right-0 z-20 mt-3 w-80 p-4">
          <span className="zs-tag">Active identity</span>
          <div className="zs-mono mt-1 break-all text-sm">{wallet.address ?? "Browsing read-only"}</div>
          <div className="mt-4 grid gap-2">
            {wallet.mode === "injected" ? (
              <button className="zs-btn-ghost flex items-center justify-center gap-2 px-3 py-2 text-sm" onClick={disconnect}>
                <LogOut size={14} aria-hidden /> Disconnect
              </button>
            ) : (
              wallet.connectors.map((connector) => (
                <button
                  key={connector.uid}
                  className="zs-btn-ghost flex items-center justify-center gap-2 px-3 py-2 text-sm"
                  disabled={wallet.connecting}
                  onClick={() =>
                    wallet.connectWith(connector).then(
                      () => setMessage("Wallet connected."),
                      (error: unknown) => setMessage(error instanceof Error ? error.message : "Could not connect wallet."),
                    )
                  }
                >
                  <PlugZap size={14} aria-hidden /> {connector.name}
                </button>
              ))
            )}
          </div>
          {message ? (
            <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]" aria-live="polite">
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createInjectedClient } from "@/lib/genlayer/client";
import { shortenAddress } from "@/lib/format";

type WalletMode = "none" | "injected";

type WalletContextValue = {
  mode: WalletMode;
  address?: `0x${string}`;
  warningAccepted: boolean;
  connectInjected: () => Promise<void>;
  disconnect: () => void;
  getWriteClient: () => Promise<Awaited<ReturnType<typeof createInjectedClient>>>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<WalletMode>("none");
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined);

  const connectInjected = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) throw new Error("No injected wallet was found in this browser.");
    const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as `0x${string}`[];
    if (!accounts?.[0]) throw new Error("No wallet account was returned.");
    const message = `ZeroSky: verify I own ${accounts[0]}`;
    await window.ethereum.request({ method: "personal_sign", params: [message, accounts[0]] });
    setAddress(accounts[0]);
    setMode("injected");
  }, []);

  const disconnect = useCallback(() => {
    setMode("none");
    setAddress(undefined);
  }, []);

  const getWriteClient = useCallback(async () => {
    if (mode === "injected" && address) return createInjectedClient(address);
    throw new Error("Connect your wallet before sending a transaction.");
  }, [address, mode]);

  const value = useMemo(
    () => ({ mode, address, warningAccepted: true, connectInjected, disconnect, getWriteClient }),
    [address, connectInjected, disconnect, getWriteClient, mode],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}

export function WalletPlate() {
  const wallet = useWallet();
  const label = wallet.mode === "injected" ? "Injected wallet" : "Read-only";
  return (
    <div className="zs-card flex flex-col gap-0.5 px-3 py-2">
      <span className="zs-eyebrow">{label}</span>
      <span className="zs-mono text-sm">{shortenAddress(wallet.address)}</span>
    </div>
  );
}

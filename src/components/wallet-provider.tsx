import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage, type Connector } from "wagmi";
import { createInjectedClient } from "@/lib/genlayer/client";
import { shortenAddress } from "@/lib/format";

export type WalletMode = "none" | "injected";

type WalletContextValue = {
  mode: WalletMode;
  address?: `0x${string}`;
  warningAccepted: boolean;
  connectors: readonly Connector[];
  connectWith: (connector: Connector) => Promise<void>;
  connecting: boolean;
  disconnect: () => void;
  getWriteClient: () => Promise<Awaited<ReturnType<typeof createInjectedClient>>>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, connector } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [verified, setVerified] = useState(false);

  const mode: WalletMode = isConnected && address && verified ? "injected" : "none";

  const connectWith = useCallback(
    async (target: Connector) => {
      const result = await connectAsync({ connector: target });
      await signMessageAsync({ message: `ZeroSky: verify I own ${result.accounts[0]}` });
      setVerified(true);
    },
    [connectAsync, signMessageAsync],
  );

  const disconnect = useCallback(() => {
    wagmiDisconnect();
    setVerified(false);
  }, [wagmiDisconnect]);

  const getWriteClient = useCallback(async () => {
    if (mode === "injected" && address && connector) {
      const provider = await connector.getProvider();
      return createInjectedClient(address, provider);
    }
    throw new Error("Connect your wallet before sending a transaction.");
  }, [address, connector, mode]);

  const value = useMemo(
    () => ({ mode, address: mode === "injected" ? address : undefined, warningAccepted: true, connectors, connectWith, connecting: isPending, disconnect, getWriteClient }),
    [address, connectWith, connectors, disconnect, getWriteClient, isPending, mode],
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

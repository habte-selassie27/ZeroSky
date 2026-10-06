import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { WalletProvider } from "@/components/wallet-provider";
import { TransactionProvider } from "@/components/transaction-provider";
import { wagmiConfig } from "@/lib/genlayer/wagmi";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <TransactionProvider>{children}</TransactionProvider>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

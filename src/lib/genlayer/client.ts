import { createAccount, createClient } from "genlayer-js";
import { chain, CHAIN_NAME, EXPLORER_BASE, GENLAYER_ENDPOINT } from "./config";

export async function createInjectedClient(address: `0x${string}`) {
  const provider = typeof window !== "undefined" ? window.ethereum : undefined;
  if (provider) {
    const chainIdHex = `0x${chain.id.toString(16)}`;
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainIdHex }] });
    } catch (err) {
      if ((err as { code?: number })?.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: chainIdHex,
            chainName: chain.name,
            rpcUrls: [GENLAYER_ENDPOINT],
            nativeCurrency: chain.nativeCurrency,
            blockExplorerUrls: [EXPLORER_BASE],
          }],
        });
      } else {
        throw err;
      }
    }
  }
  const client = createClient({ chain, endpoint: GENLAYER_ENDPOINT, account: address, provider });
  await client.connect(CHAIN_NAME);
  return client;
}

export function createGeneratedClient(privateKey: `0x${string}`) {
  const account = createAccount(privateKey);
  return createClient({ chain, endpoint: GENLAYER_ENDPOINT, account });
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    };
  }
}

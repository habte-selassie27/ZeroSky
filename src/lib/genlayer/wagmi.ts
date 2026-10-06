import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";
import { GENLAYER_ENDPOINT } from "./config";

export const studioNetChain = defineChain({
  id: 61999,
  name: "Genlayer Studio Network",
  nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
  rpcUrls: { default: { http: [GENLAYER_ENDPOINT] } },
  blockExplorers: { default: { name: "GenLayer Explorer", url: "https://explorer-studio.genlayer.com" } },
});

export const wagmiConfig = createConfig({
  chains: [studioNetChain],
  connectors: [injected()],
  transports: { [studioNetChain.id]: http(GENLAYER_ENDPOINT) },
  multiInjectedProviderDiscovery: true,
});

import { defineChain } from "@reown/appkit/networks";

export const localNode = defineChain({
  id: 31337,
  name: "localNode",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545/"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "BLOCK_EXPLORER_URL" },
  },
  contracts: {},
  chainNamespace: "eip155",
  caipNetworkId: "eip155:31337",
});

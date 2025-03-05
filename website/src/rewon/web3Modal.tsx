"use client";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia } from "@reown/appkit/networks";

import { ReactNode } from "react";

import dotenv from "dotenv";

dotenv.config();
// 1. Get projectId at https://cloud.reown.com

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

// 2. Create a metadata object
const metadata = {
  name: "TheSustainity",
  description: "TheSustainity",
  url: "https://theSustainity.netlify.app", // origin must match your domain & subdomain
  icons: ["https://theSustainity.netlify.app"],
};

// 3. Create the AppKit instance
export const walletModal = createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [sepolia],
  defaultNetwork: sepolia,
  projectId,
  allowUnsupportedChain: false,
  enableWalletConnect: true,
  featuredWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
  ],
  allWallets: "HIDE",
  features: {
    analytics: false, // Optional - defaults to your Cloud configuration
    onramp: false,
    swaps: false,
    email: false, // default to true
    socials: [],
  },
});

export default function Web3Modal({ children }: { children: ReactNode }) {
  return children;
}

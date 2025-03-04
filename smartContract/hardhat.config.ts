import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

import dotenv from "dotenv";
dotenv.config();

const PK = process.env.PK || "";
const RPC_URL =
  process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 10_000,
        details: {
          yulDetails: {
            optimizerSteps: "u",
          },
        },
      },
    },
  },
  gasReporter: {
    currency: "ETH",
    showTimeSpent: true,
    enabled: false,
  },

  networks: {
    hardhat: {
      forking: {
        url: RPC_URL,
        blockNumber: 7715717,
      },
      gas: "auto",
      gasPrice: "auto",
    },

    eth_sepolia: {
      url: RPC_URL,
      chainId: 11155111,
      accounts: [PK],
    },
  },

  mocha: {
    timeout: 100000000,
  },
};
export default config;

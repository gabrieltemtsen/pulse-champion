import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { HardhatUserConfig } from "hardhat/config";

// Plugins (to be installed):
// npm i -D hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers
import "hardhat/toolbox";

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // Base mainnet
    base: {
      chainId: 8453,
      url: process.env.BASE_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // Celo mainnet
    celo: {
      chainId: 42220,
      url: process.env.CELO_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    // Optional: add keys if you want verification helpers
    // apiKey: {
    //   base: process.env.BASESCAN_API_KEY || "",
    //   celo: process.env.CELOSCAN_API_KEY || "",
    // },
  },
};

export default config;


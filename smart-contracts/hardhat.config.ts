import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    base: {
      chainId: 8453,
      url: process.env.BASE_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    celo: {
      chainId: 42220,
      url: process.env.CELO_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

export default config;


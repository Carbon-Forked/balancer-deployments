import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: `https://testnet.hashio.io/api`
      }
    },
    hederaTestnet: {
      chainId: 296,
      url: `https://testnet.hashio.io/api`,
      accounts: [`0x${process.env.PRIVATE_KEY!}`]
    }
  },
  solidity: "0.8.28",
};

export default config;

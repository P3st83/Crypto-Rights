import { createPublicClient, http, createWalletClient, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';
import { getAddress } from 'viem/utils';
import * as hre from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // Get deployer wallet
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Deploying contracts with the account: ${deployer.account.address}`);

  try {
    // Deploy the CryptoRights contract
    console.log("Deploying CryptoRights...");
    const cryptoRights = await hre.viem.deployContract("CryptoRights");
    console.log(`CryptoRights deployed to: ${cryptoRights.address}`);

    // Deploy the CryptoRightsSubscription contract
    console.log("Deploying CryptoRightsSubscription...");
    const cryptoRightsSubscription = await hre.viem.deployContract("CryptoRightsSubscription");
    console.log(`CryptoRightsSubscription deployed to: ${cryptoRightsSubscription.address}`);

    // Deploy the CryptoRightsAuction contract with the CryptoRights address
    console.log("Deploying CryptoRightsAuction...");
    const cryptoRightsAuction = await hre.viem.deployContract("CryptoRightsAuction", [cryptoRights.address]);
    console.log(`CryptoRightsAuction deployed to: ${cryptoRightsAuction.address}`);

    console.log("Deployment completed!");

    // Return the deployed contract addresses for testing
    return {
      cryptoRights: cryptoRights.address,
      cryptoRightsSubscription: cryptoRightsSubscription.address,
      cryptoRightsAuction: cryptoRightsAuction.address
    };
  } catch (error) {
    console.error("Deployment error:", error);
    throw error;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
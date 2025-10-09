import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const factory = await ethers.getContractFactory("PulseChampion");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log("PulseChampion deployed at:", addr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Factory = await ethers.getContractFactory("PulseChampion");
  const c = await Factory.deploy();
  await c.waitForDeployment();
  console.log("PulseChampion ->", await c.getAddress());
}

main().catch((e) => { console.error(e); process.exitCode = 1; });


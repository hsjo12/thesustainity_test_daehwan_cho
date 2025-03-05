import { ethers } from "hardhat";
import { setUp } from "./setUp";
async function upgrade() {
  const { cc721 } = await setUp();

  const CC721Logic = await ethers.getContractFactory("CarbonCredit721");
  const cc721Logic = await CC721Logic.deploy();

  await cc721.upgradeToAndCall(cc721Logic.target, "0x");
  console.log(`🌟 Upgraded!!`);
}

upgrade().catch((err) => {
  console.log(err);
});

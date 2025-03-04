import { ethers } from "hardhat";
import { setUp } from "../utils/setUp";

const AMOUNT = 10; // Amount of tokens to mint
const TO = ""; // Recipient address

async function main() {
  const { cc20 } = await setUp();
  const [defaultUser] = await ethers.getSigners();

  const to = TO.trim() === "" ? ethers.Wallet.createRandom().address : TO;
  if (TO.trim() === "") {
    console.log("\n🌟 Generated a random recipient address:", to);
  }

  const amount = ethers.parseEther(String(AMOUNT));

  const balanceBeforeMint = ethers.formatEther(await cc20.balanceOf(to));
  await cc20.mint(to, amount);
  const balanceAfterMint = ethers.formatEther(await cc20.balanceOf(to));

  console.log("");
  console.log(`🌟 Minter: ${defaultUser.address}`);
  console.log("");
  console.log(`🌟 Receiver: ${to}`);
  console.log("");
  console.log(`🌟 Receiver balance before mint: ${balanceBeforeMint} CC20`);
  console.log("");
  console.log(`🌟 Minting ${AMOUNT} CC20 ...`);
  console.log("");
  console.log(`🌟 Receiver balance after mint: ${balanceAfterMint} CC20`);
}

main().catch((err) => {
  console.log(err);
});

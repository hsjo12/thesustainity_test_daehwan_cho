import { ethers } from "hardhat";
import { setUp } from "../utils/setUp";

const AMOUNT = 10; // Amount of tokens to mint
const TO = ""; // Recipient address

async function main() {
  const { cc20, cc721 } = await setUp();
  const [defaultUser] = await ethers.getSigners();

  const to = TO.trim() === "" ? ethers.Wallet.createRandom().address : TO;
  if (TO.trim() === "") {
    console.log("\n🌟 Generated a random recipient address:", to);
  }

  const amount = ethers.parseEther(String(AMOUNT));

  await cc20.mint(to, amount);
  const cc20_userBalanceBeforeMintCC721 = ethers.formatEther(
    await cc20.balanceOf(to)
  );
  const cc721_userBalanceBeforeMintCC721 = await cc721.balanceOf(to);

  await cc20.approve(cc721.target, amount);
  await cc721.mint(to, amount);

  const cc20_userBalanceAfterMintCC721 = ethers.formatEther(
    await cc20.balanceOf(to)
  );
  const cc721_userBalanceAfterMintCC721 = await cc721.balanceOf(to);

  console.log("");
  console.log(`🌟 Minter: ${defaultUser.address}`);
  console.log("");
  console.log(`🌟 Receiver: ${to}`);
  console.log("");
  console.log(
    `🌟 Receiver before mint(CC20): ${cc20_userBalanceBeforeMintCC721} CC20`
  );
  console.log(
    `🌟 Receiver before mint(CC721): ${cc721_userBalanceBeforeMintCC721} CC721`
  );
  console.log("");
  console.log(`🌟 Minting 1 CC721 by depositing ${AMOUNT} CC20 ...`);
  console.log("");
  console.log(
    `🌟 Receiver after mint(CC20): ${cc20_userBalanceAfterMintCC721} CC20`
  );
  console.log(
    `🌟 Receiver after mint(CC721): ${cc721_userBalanceAfterMintCC721} CC721`
  );
}

main().catch((err) => {
  console.log(err);
});

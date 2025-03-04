import { ethers } from "hardhat";
import { setUp } from "../utils/setUp";

const TO = ""; // User address

async function main() {
  const { cc20 } = await setUp();
  const [defaultUser] = await ethers.getSigners();

  const to = TO.trim() === "" ? defaultUser.address : TO;

  const balance = ethers.formatEther(await cc20.balanceOf(to));

  console.log("");
  console.log(`🌟 Current user: ${to}`);
  console.log("");
  console.log(`🌟 User balance : ${balance} CC20`);
}

main().catch((err) => {
  console.log(err);
});

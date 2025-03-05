import { ethers } from "hardhat";
import { setUp } from "../utils/setUp";

const TO = ""; // User address

async function main() {
  const { cc721 } = await setUp();
  const [defaultUser] = await ethers.getSigners();

  const to = TO.trim() === "" ? defaultUser.address : TO;

  const balance = await cc721.balanceOf(to);

  console.log("");
  console.log(`🌟 Current user: ${to}`);
  console.log("");
  console.log(`🌟 User balance : ${balance} CC721`);
  console.log(await cc721.tokenURI(0));
}

main().catch((err) => {
  console.log(err);
});

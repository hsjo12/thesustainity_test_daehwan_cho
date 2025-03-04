import { ethers } from "hardhat";
import { setUp } from "../utils/setUp";

const TO = ""; // User address
const MANAGER_ROLE =
  "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08";

async function main() {
  if (TO.trim() === "") {
    throw console.error("Please input address");
  }
  if (!ethers.isAddress(String(TO))) {
    throw console.error("Please input valid address");
  }
  const { cc20 } = await setUp();

  await cc20.grantRole(MANAGER_ROLE, TO);

  console.log("");
  console.log(`🌟 User(${TO}) is granted the manager role`);
  console.log("");
}

main().catch((err) => {
  console.log(err);
});

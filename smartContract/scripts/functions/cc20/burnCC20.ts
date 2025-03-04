import { ethers } from "hardhat";
import { setUp } from "../utils/setUp";

const AMOUNT = 8000000000; // Amount of tokens to burn

async function main() {
  const { cc20, router, userStorage } = await setUp();
  const [defaultUser] = await ethers.getSigners();
  const amount = ethers.parseEther(String(AMOUNT));

  let balanceBeforeBurn = ethers.formatEther(
    await cc20.balanceOf(defaultUser.address)
  );
  if (ethers.parseEther(balanceBeforeBurn) < amount) {
    console.log("");
    console.log("🌟 Not enough balance to burn!");
    console.log("");
    console.log(`🌟 Minting the same amount as the burned amount: ${AMOUNT}`);
    await cc20.mint(defaultUser.address, amount);
    balanceBeforeBurn = ethers.formatEther(
      await cc20.balanceOf(defaultUser.address)
    );
  }

  const isUserRegistered = await userStorage.userStartedAt(defaultUser);

  if (isUserRegistered === 0n) {
    console.log("");
    console.log("🌟 User information is not registered for carbon offsetting.");
    console.log("🌟 Registering user information...");
    await userStorage.register();
  }

  await cc20.approve(router.target, amount);
  await router.burnCredit20(amount);
  const balanceAfterBurn = ethers.formatEther(
    await cc20.balanceOf(defaultUser.address)
  );

  console.log("");
  console.log(`🌟 Current user: ${defaultUser.address}`);
  console.log("");
  console.log(`🌟 User balance before mint: ${balanceBeforeBurn} CC20`);
  console.log("");
  console.log(`🌟 Burning ${AMOUNT} CC20 ...`);
  console.log("");
  console.log(`🌟 User balance after mint: ${balanceAfterBurn} CC20`);
}

main().catch((err) => {
  console.log(err);
});

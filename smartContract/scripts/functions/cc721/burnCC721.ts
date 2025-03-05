import { setUp } from "../utils/setUp";
import { ethers } from "hardhat";

async function main() {
  const { cc20, cc721, router, userStorage } = await setUp();
  const [defaultUser] = await ethers.getSigners();
  const AMOUNT = 1000;
  const amount = ethers.parseEther(String(AMOUNT));

  let userBalanceBeforeBurn = await cc721.balanceOf(defaultUser.address);

  if (userBalanceBeforeBurn < 1) {
    console.log("");
    console.log("🌟 Not enough balance to burn!");
    console.log("");
    console.log(`🌟 Minting 1 CC721 by depositing ${AMOUNT} CC20 ...`);
    await cc20.mint(defaultUser.address, amount);
    await cc20.approve(cc721.target, amount);
    await cc721.mint(defaultUser, amount);
    userBalanceBeforeBurn = await cc721.balanceOf(defaultUser.address);
  }

  const isUserRegistered = await userStorage.userStartedAt(defaultUser);

  if (isUserRegistered === 0n) {
    console.log("");
    console.log("🌟 User information is not registered for carbon offsetting.");
    console.log("🌟 Registering user information...");
    await userStorage.register();
  }
  const isApproveAll = await cc721.isApprovedForAll(
    defaultUser.address,
    router.target
  );
  if (!isApproveAll) {
    await cc721.setApprovalForAll(router.target, true);
  }

  const ids = await cc721.tokensOfOwner(defaultUser.address);

  await router.burnCredit721(ids[0]);
  const balanceAfterBurn = await cc721.balanceOf(defaultUser.address);

  console.log("");
  console.log(`🌟 Current user: ${defaultUser.address}`);
  console.log("");
  console.log(`🌟 User balance before mint: ${userBalanceBeforeBurn} CC721`);
  console.log("");
  console.log(`🌟 Burning 1 CC721 ...`);
  console.log("");
  console.log(`🌟 User balance after mint: ${balanceAfterBurn} CC721`);
}

main().catch((err) => {
  console.log(err);
});

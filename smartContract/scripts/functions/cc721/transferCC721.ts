import { ethers } from "hardhat";
import { setUp } from "../utils/setUp";

const TO = ""; // Recipient address

async function main() {
  const CC20_AMOUNT = 1000;
  const cc20_amount = ethers.formatEther(String(CC20_AMOUNT));

  const { cc20, cc721 } = await setUp();
  const [from_user] = await ethers.getSigners();

  const to = TO.trim() === "" ? ethers.Wallet.createRandom().address : TO;
  if (TO.trim() === "") {
    console.log("\n🌟 Generated a random recipient address:", to);
  }

  let fromUserBalanceBeforeTransfer = await cc721.balanceOf(from_user.address);

  if (fromUserBalanceBeforeTransfer < 1) {
    console.log("");
    console.log("🌟 Not enough balance to transfer!");
    console.log("");
    console.log(`🌟 Minting 1 CC721 by depositing ${cc20_amount} CC20 ...`);

    await cc20.mint(from_user.address, cc20_amount);
    await cc20.approve(cc721.target, cc20_amount);
    await cc721.mint(from_user, cc20_amount);

    fromUserBalanceBeforeTransfer = await cc721.balanceOf(from_user.address);
  }
  const toUserBalanceBeforeTransfer = await cc721.balanceOf(to);
  const ids = await cc721.tokensOfOwner(from_user.address);
  const tx = await cc721.transferFrom(from_user.address, to, ids[0]);
  const receipt = await tx.wait();
  let transfer_event_from,
    transfer_event_to,
    transfer_event_amount = 0;

  if (receipt?.logs) {
    receipt.logs.forEach((log) => {
      const parsedLog = cc721.interface.parseLog(log);

      if (parsedLog) {
        const { args } = parsedLog;
        [transfer_event_from, transfer_event_to, transfer_event_amount] =
          Array.from(args);
      }
    });
  }

  const fromUserBalanceAfterTransfer = await cc721.balanceOf(from_user.address);
  const toUserBalanceAfterTransfer = await cc721.balanceOf(to);

  console.log("");
  console.log(`🌟 Sender: ${from_user.address}`);
  console.log("");
  console.log(`🌟 Receiver: ${to}`);
  console.log("");
  console.log(
    `🌟 From user balance before transfer: ${fromUserBalanceBeforeTransfer} CC20`
  );
  console.log("");
  console.log(
    `🌟 To user balance before transfer: ${toUserBalanceBeforeTransfer} CC20`
  );
  console.log("");
  console.log(
    `🌟 ${transfer_event_from} ➡️   ${transfer_event_to} (amount: ${transfer_event_amount} cc20)`
  );
  console.log("");
  console.log(
    `🌟 From user balance after transfer: ${fromUserBalanceAfterTransfer} CC20`
  );
  console.log("");
  console.log(
    `🌟 To user balance after transfer: ${toUserBalanceAfterTransfer} CC20`
  );
}
main().catch((err) => {
  console.log(err);
});

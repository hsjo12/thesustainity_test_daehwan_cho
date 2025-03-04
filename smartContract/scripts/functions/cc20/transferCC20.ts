import { ethers } from "hardhat";
import { setUp } from "../utils/setUp";

const AMOUNT = 10; // Amount of tokens to transfer
const TO = ""; // Recipient address

async function main() {
  const { cc20 } = await setUp();
  const [from_user] = await ethers.getSigners();

  const to = TO.trim() === "" ? ethers.Wallet.createRandom().address : TO;
  if (TO.trim() === "") {
    console.log("\n🌟 Generated a random recipient address:", to);
  }

  const amount = ethers.parseEther(String(AMOUNT));

  const fromUserBalanceBeforeTransfer = ethers.formatEther(
    await cc20.balanceOf(from_user.address)
  );
  const toUserBalanceBeforeTransfer = ethers.formatEther(
    await cc20.balanceOf(to)
  );

  const tx = await cc20.transfer(to, amount);
  const receipt = await tx.wait();
  let transfer_event_from,
    transfer_event_to,
    transfer_event_amount = 0;

  if (receipt?.logs) {
    receipt.logs.forEach((log) => {
      const parsedLog = cc20.interface.parseLog(log);

      if (parsedLog) {
        const { args } = parsedLog;
        [transfer_event_from, transfer_event_to, transfer_event_amount] =
          Array.from(args);
      }
    });
  }

  const formattedAmount = ethers.formatEther(String(transfer_event_amount));
  const fromUserBalanceAfterTransfer = ethers.formatEther(
    await cc20.balanceOf(from_user.address)
  );
  const toUserBalanceAfterTransfer = ethers.formatEther(
    await cc20.balanceOf(to)
  );

  console.log(`\n🌟 Sender: ${from_user.address}`);
  console.log(`\n🌟 Receiver: ${to}`);
  console.log(
    `\n🌟 From user balance before transfer: ${fromUserBalanceBeforeTransfer} CC20`
  );
  console.log(
    `\n🌟 To user balance before transfer: ${toUserBalanceBeforeTransfer} CC20`
  );
  console.log(
    `\n🌟 ${transfer_event_from} ➡️   ${transfer_event_to} (amount: ${formattedAmount} cc20)`
  );
  console.log(
    `\n🌟 From user balance after transfer: ${fromUserBalanceAfterTransfer} CC20`
  );
  console.log(
    `\n🌟 To user balance after transfer: ${toUserBalanceAfterTransfer} CC20`
  );
}
main().catch((err) => {
  console.log(err);
});

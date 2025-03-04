import CarbonCredit20Json from "../abis/CarbonCredit20.json";
import CarbonCredit721Json from "../abis/CarbonCredit721.json";
import UserStorageJson from "../abis/userStorage.json";
import RouterJson from "../abis/router.json";
import {
  Contract,
  ethers,
  JsonRpcProvider,
  TransactionResponse,
  Wallet,
} from "ethers";
import { RequestHandler } from "express";
import dotenv from "dotenv";
dotenv.config();
const PK = process.env.PK || "";
const RPC_URL = process.env.RPC_URL || "";
const PROVIDER = new JsonRpcProvider(RPC_URL);
const SIGNER = new Wallet(PK, PROVIDER);
const CC20 = new Contract(
  CarbonCredit20Json.address,
  CarbonCredit20Json.abi,
  SIGNER
);
const CC721 = new Contract(
  CarbonCredit721Json.address,
  CarbonCredit721Json.abi,
  SIGNER
);
const USER_STORAGE = new Contract(
  UserStorageJson.address,
  UserStorageJson.abi,
  SIGNER
);
const ROUTER = new Contract(RouterJson.address, RouterJson.abi, SIGNER);
export const balanceOf: RequestHandler = async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!address) {
      res.status(400).json({ error: "Address is required" });
      return;
    }

    const balance = await CC721.balanceOf(address);
    res.status(200).json({ result: String(balance) });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const mint: RequestHandler = async (req, res, next) => {
  try {
    let { recipient, depositAmount } = req.body;
    depositAmount = BigInt(depositAmount);
    if (!recipient || !depositAmount) {
      res.status(400).json({ error: "Recipient and amount are required" });
      return;
    }
    const formattedAmount = ethers.formatEther(BigInt(depositAmount));
    const balance = await CC20.balanceOf(SIGNER.address);
    if (balance < BigInt(depositAmount)) {
      const tx = await CC20.mint(SIGNER.address, depositAmount);
      await tx.wait();
    }
    const approveTx = await CC20.approve(CC721.target, depositAmount);
    await approveTx.wait();

    const tx: TransactionResponse = await CC721.mint(recipient, depositAmount);
    const receipt = await tx.wait();

    if (receipt && receipt.status == 1) {
      res.status(200).json({
        txHash: receipt?.hash,
        result: `Minting 1 CC721 by depositing ${formattedAmount} CC20 ... to ${recipient}`,
      });
    } else {
      res.status(400).json({ error: "Transaction failed" });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const transfer: RequestHandler = async (req, res, next) => {
  try {
    let { recipient, id } = req.body;
    id = BigInt(id);
    if (!recipient || id == null) {
      res.status(400).json({ error: "Recipient and id are required" });
      return;
    }

    const isOwner = await CC721.ownerOf(id);

    if (!isOwner) {
      res
        .status(400)
        .json({ error: "The token id does not belong to the user" });
      return;
    }

    const tx: TransactionResponse = await CC721.transferFrom(
      SIGNER.address,
      recipient,
      id
    );
    const receipt = await tx.wait();

    if (receipt && receipt.status == 1) {
      res.status(200).json({
        txHash: receipt?.hash,
        result: `${SIGNER.address} ➡️ ${recipient} (transfer token(CC721) id: ${id})`,
      });
    } else {
      res.status(400).json({ error: "Transaction failed" });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const burn: RequestHandler = async (req, res, next) => {
  try {
    let { id } = req.body;
    id = BigInt(id);
    if (id == null) {
      res.status(400).json({ error: "Recipient and id are required" });
      return;
    }

    const isOwner = await CC721.ownerOf(id);

    if (!isOwner) {
      res
        .status(400)
        .json({ error: "The token id does not belong to the user" });
      return;
    }

    const isUserRegistered = await USER_STORAGE.userStartedAt(SIGNER.address);
    if (isUserRegistered === 0n) {
      const tx = await USER_STORAGE.register();
      await tx.wait();
    }

    const isApproveAll = await CC721.isApprovedForAll(
      SIGNER.address,
      ROUTER.target
    );
    if (!isApproveAll) {
      const tx = await CC721.setApprovalForAll(ROUTER.target, true);
      await tx.wait();
    }

    const tx: TransactionResponse = await ROUTER.burnCredit721(id);
    const receipt = await tx.wait();

    if (receipt && receipt.status == 1) {
      res.status(200).json({
        txHash: receipt.hash,
        result: `Burned 1 CC721 (id: ${id}) from ${SIGNER.address}`,
      });
    } else {
      res.status(400).json({ error: "Transaction failed" });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

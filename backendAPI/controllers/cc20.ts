import CarbonCredit20Json from "../abis/CarbonCredit20.json";
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

export const balanceOf: RequestHandler = async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!address) {
      res.status(400).json({ error: "Address is required" });
      return;
    }

    const balance = await CC20.balanceOf(address);
    res.status(200).json({ result: String(balance) });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const mint: RequestHandler = async (req, res, next) => {
  try {
    const { recipient, amount } = req.body;

    if (!recipient || !amount) {
      res.status(400).json({ error: "Recipient and amount are required" });
      return;
    }
    const formattedAmount = ethers.formatEther(BigInt(amount));

    const tx: TransactionResponse = await CC20.mint(recipient, BigInt(amount));
    const receipt = await tx.wait();

    if (receipt && receipt.status == 1) {
      res.status(200).json({
        txHash: receipt?.hash,
        result: `Minted ${parseFloat(
          Number(formattedAmount).toFixed(4)
        )} CC20 to ${recipient}`,
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
    const { recipient, amount } = req.body;

    if (!recipient || !amount) {
      res.status(400).json({ error: "Recipient and amount are required" });
      return;
    }

    const balanceOfUser = await CC20.balanceOf(SIGNER.address);

    if (balanceOfUser < BigInt(amount)) {
      res
        .status(400)
        .json({ error: "The amount of token to send is not enough" });
      return;
    }

    const formattedAmount = ethers.formatEther(BigInt(amount));

    const tx: TransactionResponse = await CC20.transfer(
      recipient,
      BigInt(amount)
    );
    const receipt = await tx.wait();

    if (receipt && receipt.status == 1) {
      res.status(200).json({
        txHash: receipt?.hash,
        result: `${
          SIGNER.address
        } ➡️ ${recipient} (transfer amount: ${parseFloat(
          Number(formattedAmount).toFixed(4)
        )} CC20)`,
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
    const { recipient, amount } = req.body;

    if (!recipient || !amount) {
      res.status(400).json({ error: "Recipient and amount are required" });
      return;
    }

    const balanceOfUser = await CC20.balanceOf(SIGNER.address);

    if (balanceOfUser < BigInt(amount)) {
      res
        .status(400)
        .json({ error: "The amount of token to burn is not enough" });
      return;
    }

    const formattedAmount = ethers.formatEther(BigInt(amount));

    const tx: TransactionResponse = await CC20.burn(BigInt(amount));
    const receipt = await tx.wait();

    if (receipt && receipt.status == 1) {
      res.status(200).json({
        txHash: receipt.hash,
        result: `Burned ${parseFloat(
          Number(formattedAmount).toFixed(4)
        )} CC20 from ${recipient}`,
      });
    } else {
      res.status(400).json({ error: "Transaction failed" });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

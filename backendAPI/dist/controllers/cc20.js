"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mint = exports.balanceOf = void 0;
const CarbonCredit20_json_1 = __importDefault(require("../abis/CarbonCredit20.json"));
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PK = process.env.PK || "";
const RPC_URL = process.env.RPC_URL || "";
const PROVIDER = new ethers_1.JsonRpcProvider(RPC_URL);
const SIGNER = new ethers_1.Wallet(PK, PROVIDER);
const CC20 = new ethers_1.Contract(CarbonCredit20_json_1.default.address, CarbonCredit20_json_1.default.abi, SIGNER);
const balanceOf = async (req, res, next) => {
    try {
        const { address } = req.body;
        if (!address) {
            res.status(400).json({ error: "Address is required" });
            return;
        }
        console.log(`address`, address);
        const balance = await CC20.balanceOf(address);
        res.status(200).json({ result: String(balance) });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.balanceOf = balanceOf;
const mint = async (req, res, next) => {
    try {
        const { recipient, amount } = req.body;
        if (!recipient || !amount) {
            res.status(400).json({ error: "Recipient and amount are required" });
            return;
        }
        console.log(amount, typeof amount);
        const formattedAmount = amount;
        console.log("1");
        const tx = await CC20.mint(recipient, amount);
        const receipt = await tx.wait();
        console.log("2");
        if (receipt && receipt.status == 1) {
            res
                .status(200)
                .json({ result: `Minted ${formattedAmount} CC20 to ${recipient}` });
        }
        else {
            res.status(400).json({ error: "Transaction failed" });
        }
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.mint = mint;

import { ethers } from "ethers";
import dotenv from "dotenv";

import { Addressable } from "ethers";
dotenv.config();
export const getProvider = () => {
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC);
};

export const getContract = (
  target: string | Addressable,
  abi: ethers.Interface | ethers.InterfaceAbi
) => {
  const provider = getProvider();
  return new ethers.Contract(target, abi, provider);
};

export const getBalance = async (addr: string | Addressable) => {
  const provider = getProvider();
  return await provider.getBalance(addr);
};

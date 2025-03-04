import { ethers, EventLog, Log } from "ethers";

export const convertUnit = (num: number | bigint | string, dec: number = 3) => {
  num = Number(num);
  return parseFloat(num.toFixed(dec).toLocaleString());
};

export const getTokenAmount = (pricePerToken: bigint, amount: string) => {
  const amountInETH = ethers.parseEther(amount);
  return (BigInt(1e18) * amountInETH) / pricePerToken;
};

export const sortEvents = (lists: Array<EventLog | Log>) => {
  return lists.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) {
      return b.blockNumber - a.blockNumber;
    }
    return b.transactionIndex - a.transactionIndex;
  });
};

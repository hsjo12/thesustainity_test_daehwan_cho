"use client";
import { ContextAPI, ContextType } from "@/contextAPI/websiteAPI";
import CarbonCredit20Json from "../../../abis/carbonCredit20.json";
import CarbonCredit721Json from "../../../abis/carbonCredit721.json";
import { getBalance, getContract } from "@/utils/provider";
import { convertUnit } from "@/utils/utils";
import { useAppKitAccount } from "@reown/appkit/react";
import { ethers } from "ethers";
import { useCallback, useContext, useEffect, useState } from "react";
import Loading from "@/components/loading/loading";

export default function UserInfo() {
  const { isConnected, address } = useAppKitAccount();
  const context = (useContext(ContextAPI) || {}) as ContextType;
  const { update = 0 } = context;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userETHBalance, setUserETHBalance] = useState<{
    value: bigint;
    valueInETH: number | string;
  }>({ value: 0n, valueInETH: 0 });
  const [userCarbonCredit20Balance, setUserCarbonCredit20Balance] = useState<{
    value: bigint;
    valueInETH: number | string;
  }>({ value: 0n, valueInETH: 0 });
  const [userCarbonCredit721Balance, setUserCarbonCredit721Balance] = useState<
    bigint | number | string
  >(0);

  const getAllTheBalance = useCallback(async () => {
    if (!isConnected || !address) return;
    // Get ETH balance
    try {
      const value = await getBalance(address);
      const valueInETH = ethers.formatEther(value);
      setUserETHBalance({ value, valueInETH });
    } catch (error) {
      console.error(error);
    }

    // Get CarbonCredit20 balance
    try {
      const contract = getContract(
        CarbonCredit20Json.address,
        CarbonCredit20Json.abi
      );
      const value = await contract.balanceOf(address);
      const valueInETH = ethers.formatEther(value);
      setUserCarbonCredit20Balance({ value, valueInETH });
    } catch (error) {
      console.error(error);
    }

    // GEt CarbonCredit721 balance
    try {
      const contract = getContract(
        CarbonCredit721Json.address,
        CarbonCredit721Json.abi
      );
      const value = await contract.balanceOf(address);

      setUserCarbonCredit721Balance(value);
    } catch (error) {
      console.error(error);
    }
  }, [address, isConnected, update]);

  useEffect(() => {
    setIsLoading(true);
    if (!address || !isConnected) {
      return setIsLoading(false);
    }
    getAllTheBalance().finally(() => {
      setIsLoading(false);
    });
  }, [isConnected, address, getAllTheBalance, update]);
  if (isLoading) {
    return (
      <div className="w-full flex flex-col justify-center">
        <div className="w-full flex flex-col box justify-center items-center">
          <Loading />
        </div>
      </div>
    );
  } else {
    return isConnected ? (
      <div className="box flex flex-col gap-3 justify-center">
        <p>
          User : {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>

        <p>ETH balance : {convertUnit(userETHBalance.valueInETH)} ETH</p>
        <p>
          CC20 balance : {convertUnit(userCarbonCredit20Balance.valueInETH)}{" "}
          CC20
        </p>
        <p>CC721(NFT) balance : {userCarbonCredit721Balance} CC721</p>
      </div>
    ) : (
      <div className="box flex flex-col justify-center items-center largeText">
        Wallet connection required
      </div>
    );
  }
}

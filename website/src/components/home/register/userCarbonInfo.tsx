"use client";
import Loading from "@/components/loading/loading";
import UserStorageJson from "../../../abis/userStorage.json";
import { ContextAPI, ContextType } from "@/contextAPI/websiteAPI";
import { txMessage } from "@/toastify/toastMessageStyle";
import { getContract } from "@/utils/provider";
import { convertUnit } from "@/utils/utils";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { Eip1193Provider, ethers } from "ethers";
import { Contract } from "ethers";
import { BrowserProvider } from "ethers";
import { useCallback, useContext, useEffect, useState } from "react";

export default function UserCarbonInfo() {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const context = (useContext(ContextAPI) || {}) as ContextType;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {
    setTxScreenOn = () => {},
    setUpdate = () => {},
    update = 0,
  } = context;

  const [userExists, setUserExists] = useState<boolean>(false);
  const [userCarbonInfo, setUserCarbonInfo] = useState<{
    emittedCarbon: bigint | number | string;
    surPlusCarbonCredits: bigint | number | string;
    totalBurnedCarbonCredits: bigint | number | string;
  }>({
    emittedCarbon: 0,
    surPlusCarbonCredits: 0,
    totalBurnedCarbonCredits: 0,
  });
  const [emittedSpeed, setEmittedSpeed] = useState<bigint | number | string>(0);
  const isUserRegistered = useCallback(async () => {
    if (!isConnected || !address) return;
    try {
      const contract = getContract(
        UserStorageJson.address,
        UserStorageJson.abi
      );
      const userExists = (await contract.userStartedAt(address)) !== 0n;
      setUserExists(userExists);
    } catch (error) {
      console.error(error);
    }
  }, [address, isConnected]);

  const register = useCallback(async () => {
    if (!address || !isConnected) return;
    try {
      setTxScreenOn(true);
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(
        UserStorageJson.address,
        UserStorageJson.abi,
        signer
      );

      const tx = await contract.register();
      await txMessage(tx);
      setUpdate(new Date().getTime());
      setTxScreenOn(false);
    } catch (error) {
      console.error(error);
      setTxScreenOn(false);
    }
  }, [address, isConnected, setTxScreenOn, setUpdate, walletProvider]);

  const getUserCarbonInfo = useCallback(async () => {
    if (!address || !isConnected) return;

    try {
      const contract = getContract(
        UserStorageJson.address,
        UserStorageJson.abi
      );
      const userCarbonBalance = await contract.emittedCarbonAmountOf(address);
      const speed = await contract.speed();

      setUserCarbonInfo({
        emittedCarbon: ethers.formatEther(userCarbonBalance[0]),
        surPlusCarbonCredits: ethers.formatEther(userCarbonBalance[1]),
        totalBurnedCarbonCredits: ethers.formatEther(userCarbonBalance[2]),
      });

      setEmittedSpeed(ethers.formatEther(speed));
    } catch (error) {
      console.error(error);
    }
  }, [address, isConnected]);

  useEffect(() => {
    setIsLoading(true);
    if (!address || !isConnected) {
      return setIsLoading(false);
    }
    isUserRegistered();
    if (userExists) {
      getUserCarbonInfo().finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [
    isConnected,
    address,
    isUserRegistered,
    userExists,
    getUserCarbonInfo,
    update,
  ]);

  useEffect(() => {
    if (!isConnected || !address) return;

    const intervalId = setInterval(() => {
      setUserCarbonInfo((prev) => {
        const surPlusCarbonCredits =
          Number(prev.surPlusCarbonCredits) - Number(emittedSpeed) < 0
            ? 0
            : Number(prev.surPlusCarbonCredits) - Number(emittedSpeed);
        const emittedCarbon =
          surPlusCarbonCredits > 0
            ? 0
            : Number(prev.emittedCarbon) + Number(emittedSpeed);
        return { ...prev, emittedCarbon, surPlusCarbonCredits };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isConnected, address, emittedSpeed]);
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
      userExists ? (
        <div className="box flex flex-col gap-3 justify-center">
          <p>Emitted Carbon : {convertUnit(userCarbonInfo.emittedCarbon)}</p>
          <p>
            Surplus Carbon Credit :{" "}
            {convertUnit(userCarbonInfo.surPlusCarbonCredits)}
          </p>
          <p>
            Total Burned Carbon Credit :{" "}
            {convertUnit(userCarbonInfo.totalBurnedCarbonCredits)}
          </p>
        </div>
      ) : (
        <div className="box flex flex-col justify-center items-center largeText">
          <button className="btn" onClick={register}>
            User Register
          </button>
        </div>
      )
    ) : (
      <div className="box flex flex-col justify-center items-center largeText">
        Wallet connection required
      </div>
    );
  }
}

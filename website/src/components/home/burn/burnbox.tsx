"use client";
import userStorageJson from "../../../abis/userStorage.json";
import CarbonCredit20Json from "../../../abis/carbonCredit20.json";
import RouterJson from "../../../abis/router.json";
import { ContextAPI, ContextType } from "@/contextAPI/websiteAPI";
import { toastMessage, txMessage } from "@/toastify/toastMessageStyle";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { Contract } from "ethers";
import { Eip1193Provider } from "ethers";
import { BrowserProvider } from "ethers";
import { ethers } from "ethers";
import { useCallback, useContext, useState } from "react";

export default function BurnBox() {
  const context = (useContext(ContextAPI) || {}) as ContextType;
  const { setTxScreenOn = () => {}, setUpdate = () => {} } = context;
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [inputValue, setInputValue] = useState<{
    displayValue: string;
    value: bigint;
  }>({ displayValue: "", value: 0n });

  const changeInputValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue: string | bigint = e.target.value;
      const displayValue: string = inputValue.toString();

      if (inputValue === "") inputValue = 0n;
      inputValue = ethers.parseEther(String(inputValue));
      setInputValue({ displayValue, value: inputValue });
    },
    []
  );

  const burn = useCallback(async () => {
    try {
      setTxScreenOn(true);
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();

      const userStorage = new Contract(
        userStorageJson.address,
        userStorageJson.abi,
        signer
      );
      const cc20 = new Contract(
        CarbonCredit20Json.address,
        CarbonCredit20Json.abi,
        signer
      );
      const router = new Contract(RouterJson.address, RouterJson.abi, signer);

      const isUserRegistered =
        Number(await userStorage.userStartedAt(address)) !== 0;

      if (!isUserRegistered) {
        toastMessage("Please Register", "warn");
        const tx = await userStorage.register();
        await txMessage(tx);
      }

      const allowance = await cc20.allowance(address, router.target);

      if (inputValue.value > allowance) {
        toastMessage("Please approve", "warn");
        const tx = await cc20.approve(router.target, inputValue.value);
        await txMessage(tx);
      }

      const tx = await router.burnCredit20(inputValue.value);
      await txMessage(tx);
      setUpdate(new Date().getTime());
      setTxScreenOn(false);
      setInputValue({ displayValue: "", value: 0n });
    } catch (error) {
      setTxScreenOn(false);
      console.log(error);
    }
  }, [inputValue.value, address, setTxScreenOn, setUpdate, walletProvider]);

  return (
    <div className="w-full flex flex-col justify-center">
      {isConnected ? (
        <div className="w-full box flex flex-col justify-center items-center largeText">
          <div className="w-[90%] md:w-[80%]  flex flex-col justify-center items-center gap-3">
            <div className="w-full flex rounded-xl px-2 bg-[#cecece] text-black">
              <input
                type="number"
                min="0"
                value={inputValue.displayValue}
                onChange={changeInputValue}
                className="swapInput w-full flex justify-end"
                placeholder="0"
              />
              <p className="">CC20</p>
            </div>
            <button className="btn w-full" onClick={burn}>
              burn
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col">
          <div className="box flex flex-col justify-center items-center largeText">
            Wallet connection required
          </div>
        </div>
      )}
    </div>
  );
}

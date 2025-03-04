"use client";

import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useCallback, useContext, useState } from "react";
import CarbonCredit20Json from "../../../abis/carbonCredit20.json";
import CarbonCredit721Json from "../../../abis/carbonCredit721.json";

import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Eip1193Provider } from "ethers";
import { Contract } from "ethers";
import {
  toastMessage,
  txApprove,
  txMessage,
} from "@/toastify/toastMessageStyle";
import { ContextAPI, ContextType } from "@/contextAPI/websiteAPI";
export default function CC721Box() {
  const context = (useContext(ContextAPI) || {}) as ContextType;
  const { setTxScreenOn = () => {}, setUpdate = () => {} } = context;
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const [inputToAddress, setInputToAddress] = useState<string>("");
  const [inputValue, setInputValue] = useState<{
    displayValue: string;
    value: bigint;
  }>({ displayValue: "", value: 0n });

  const changeInputToAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const toAddress: string = e.target.value;
      setInputToAddress(toAddress);
    },
    []
  );

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

  const mint = useCallback(async () => {
    const isAddress = ethers.isAddress(inputToAddress);

    if (!isAddress || inputToAddress === ethers.ZeroAddress)
      return toastMessage("Invalid address", "warn");

    try {
      setTxScreenOn(true);
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();

      const cc20 = new Contract(
        CarbonCredit20Json.address,
        CarbonCredit20Json.abi,
        signer
      );

      const allowance = await cc20.allowance(
        address,
        CarbonCredit721Json.address
      );

      if (allowance < inputValue.value) {
        toastMessage("Please approve", "warn");
        const tx = await cc20.approve(
          CarbonCredit721Json.address,
          inputValue.value
        );
        await txApprove(tx);
      }

      const cc721 = new Contract(
        CarbonCredit721Json.address,
        CarbonCredit721Json.abi,
        signer
      );

      const tx = await cc721.mint(inputToAddress, inputValue.value);
      await txMessage(tx);
      setUpdate(new Date().getTime());
      setTxScreenOn(false);
      setInputToAddress("");
      setInputValue({ displayValue: "", value: 0n });
    } catch (error) {
      setTxScreenOn(false);
      console.log(error);
    }

    //  const tx = await contract.mint()
  }, [
    inputToAddress,
    inputValue.value,
    address,
    setTxScreenOn,
    setUpdate,
    walletProvider,
  ]);

  return (
    <section className="w-full flex flex-col justify-center gap-3 h-full">
      {isConnected ? (
        <div className="w-full flex flex-col gap-3  h-full ">
          <div className="box flex flex-col justify-center items-center largeText font-bebas_neue h-full">
            <div className="w-[90%] md:w-[80%] flex flex-col justify-center items-center gap-3">
              <p className="text-highlight">Deposit CC20 & Mint CC721</p>
              <div className="w-full flex rounded-xl px-2 bg-[#cecece] text-black">
                <input
                  type="text"
                  min="0"
                  value={inputToAddress}
                  onChange={changeInputToAddress}
                  className="swapInput w-full flex justify-end "
                  placeholder="To"
                />
              </div>
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

              <button onClick={mint} className="btn w-full">
                Deposit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col">
          <div className="box flex flex-col justify-center items-center largeText">
            Wallet connection required
          </div>
        </div>
      )}
    </section>
  );
}

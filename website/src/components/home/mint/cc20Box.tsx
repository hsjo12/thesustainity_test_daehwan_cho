"use client";

import { getContract } from "@/utils/provider";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useCallback, useContext, useEffect, useState } from "react";
import CarbonCredit20Json from "../../../abis/carbonCredit20.json";

import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Eip1193Provider } from "ethers";
import { Contract } from "ethers";
import { toastMessage, txMessage } from "@/toastify/toastMessageStyle";
import { ContextAPI, ContextType } from "@/contextAPI/websiteAPI";
export default function CC20Box() {
  const MANAGER =
    "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08";
  const context = (useContext(ContextAPI) || {}) as ContextType;
  const { setTxScreenOn = () => {}, setUpdate = () => {} } = context;
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [hasManagerRole, setHasManagerRole] = useState<boolean>(false);
  const [inputToAddress, setInputToAddress] = useState<string>("");
  const [inputValue, setInputValue] = useState<{
    displayValue: string;
    value: bigint;
  }>({ displayValue: "", value: 0n });

  useEffect(() => {
    if (!isConnected || !address) return;

    async function checkManagerRole() {
      const contract = await getContract(
        CarbonCredit20Json.address,
        CarbonCredit20Json.abi
      );
      const hasRole = await contract.hasRole(MANAGER, address);

      setHasManagerRole(hasRole);
    }
    checkManagerRole();
  }, [isConnected, address]);

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
    if (!isConnected || !address)
      return toastMessage("Please connect again", "warn");

    if (!hasManagerRole) return toastMessage("No permission", "warn");
    const isAddress = ethers.isAddress(inputToAddress);

    if (!isAddress || inputToAddress === ethers.ZeroAddress)
      return toastMessage("Invalid address", "warn");

    try {
      setTxScreenOn(true);
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(
        CarbonCredit20Json.address,
        CarbonCredit20Json.abi,
        signer
      );

      const tx = await contract.mint(inputToAddress, inputValue.value);
      await txMessage(tx);
      setUpdate(new Date().getTime());
      setTxScreenOn(false);
      setInputToAddress("");
      setInputValue({ displayValue: "", value: 0n });
    } catch (error) {
      setTxScreenOn(false);
      console.log(error);
    }
  }, [
    inputToAddress,
    inputValue.value,
    hasManagerRole,
    setTxScreenOn,
    setUpdate,
    walletProvider,
    address,
    isConnected,
  ]);

  return (
    <div className="w-full flex flex-col justify-center gap-3">
      {isConnected ? (
        <div className="w-full flex flex-col">
          <div className="box flex flex-col justify-center items-center largeText font-bebas_neue">
            <div className="w-[90%] md:w-[80%] flex flex-col justify-center items-center gap-3">
              {hasManagerRole ? (
                <p className="text-highlight">you are eligible to mint CC20</p>
              ) : (
                <p className="text-red-700">
                  you are not eligible to mint CC20
                </p>
              )}
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
                <p>CC20</p>
              </div>

              <button onClick={mint} className="btn w-full">
                Mint
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
    </div>
  );
}

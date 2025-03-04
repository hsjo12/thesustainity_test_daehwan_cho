"use client";

import { getContract } from "@/utils/provider";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useCallback, useContext, useEffect, useState } from "react";
import RouterJson from "../../../abis/router.json";
import { FaArrowDown } from "react-icons/fa";
import { convertUnit, getTokenAmount } from "@/utils/utils";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { txMessage } from "@/toastify/toastMessageStyle";
import { Contract } from "ethers";
import { Eip1193Provider } from "ethers";
import { ContextAPI, ContextType } from "@/contextAPI/websiteAPI";
export default function BuyBox() {
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [inputValue, setInputValue] = useState<string>("");

  const [pricePerToken, setPricePerToken] = useState<bigint>(0n);
  const [expectedCC20Amount, setExpectedCC20Amount] = useState<{
    value: bigint;
    valueInETH: string;
  }>({ value: 0n, valueInETH: "0" });
  const context = (useContext(ContextAPI) || {}) as ContextType;
  const { setTxScreenOn = () => {}, setUpdate = () => {} } = context;
  useEffect(() => {
    async function getPricePerToken() {
      const contract = await getContract(RouterJson.address, RouterJson.abi);

      const price = await contract.pricePerToken();

      setPricePerToken(price);
    }
    getPricePerToken();
  }, []);

  const changeInputValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string = e.target.value;
      const displayValue: string = e.target.value;

      if (value == null || value === "") value = "0";

      const expectedCC20Amount = getTokenAmount(pricePerToken, value);

      setExpectedCC20Amount({
        value: expectedCC20Amount,
        valueInETH: ethers.formatEther(expectedCC20Amount),
      });

      setInputValue(displayValue);
    },
    [pricePerToken]
  );

  const swap = useCallback(async () => {
    try {
      setTxScreenOn(true);
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(RouterJson.address, RouterJson.abi, signer);
      const tx = await contract.buyCredit20({
        value: ethers.parseEther(inputValue),
      });
      await txMessage(tx);
      setUpdate(new Date().getTime());
      setTxScreenOn(false);
      setInputValue("");
      setExpectedCC20Amount({
        value: 0n,
        valueInETH: "0",
      });
    } catch (error) {
      setTxScreenOn(false);
      console.log(error);
    }
  }, [inputValue, setTxScreenOn, setUpdate, walletProvider]);

  return (
    <div className="w-full flex flex-col justify-center">
      {isConnected ? (
        <div className="w-full flex flex-col">
          <div className="box flex flex-col justify-center items-center largeText font-bebas_neue">
            <div className="w-[90%] md:w-[80%] flex flex-col justify-center items-center gap-3">
              <p>1 CC20 = {ethers.formatEther(pricePerToken)} ETH</p>
              <div className="w-full flex rounded-xl px-2 bg-[#cecece] text-black">
                <input
                  type="number"
                  min="0"
                  value={inputValue}
                  onChange={changeInputValue}
                  className="swapInput w-full flex justify-end"
                  placeholder="0"
                />
                <p className="">ETH</p>
              </div>

              <FaArrowDown className="text-highlight" />
              <p>
                You will receive {convertUnit(expectedCC20Amount.valueInETH)}{" "}
                CC20
              </p>
              <button onClick={swap} className="btn">
                Swap
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

"use client";
import { fetchEvents } from "@/utils/fetchEvents";
import CarbonCredit20Json from "../../../abis/carbonCredit20.json";
import CarbonCredit721Json from "../../../abis/carbonCredit721.json";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { Contract, ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Eip1193Provider } from "ethers";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { EventLog } from "ethers";
import dotenv from "dotenv";
import { convertUnit, sortEvents } from "@/utils/utils";
import { Log } from "ethers";
import { ContextAPI, ContextType } from "@/contextAPI/websiteAPI";
import { FaLongArrowAltRight } from "react-icons/fa";
import { GoLink } from "react-icons/go";
import Link from "next/link";
import Loading from "@/components/loading/loading";
dotenv.config();
export default function EventBox() {
  const STARTING_BLOCK = Number(process.env.NEXT_PUBLIC_STARTING_BLOCK);
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [sortedEventList, setSortedEventList] = useState<(EventLog | Log)[]>(
    []
  );
  const context = (useContext(ContextAPI) || {}) as ContextType;
  const { isDesktop, update } = context;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const addressRangeSlice = isDesktop ? [7, -7] : [4, -4];
  const getEvents = useCallback(async () => {
    if (!isConnected || !address) return;
    try {
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const cc20 = new Contract(
        CarbonCredit20Json.address,
        CarbonCredit20Json.abi,
        signer
      );
      const cc721 = new Contract(
        CarbonCredit721Json.address,
        CarbonCredit721Json.abi,
        signer
      );

      const cc20SentFilter = cc20.filters.Transfer(address, null);
      const cc20ReceivedFilter = cc20.filters.Transfer(null, address);

      const cc721SentFilter = cc721.filters.Transfer(address, null);
      const cc721ReceivedFilter = cc721.filters.Transfer(null, address);

      const [
        cc20SentEvents,
        cc20ReceiveEvents,
        cc721SentEvents,
        cc721ReceiveEvents,
      ] = await Promise.all([
        fetchEvents(ethersProvider, cc20, cc20SentFilter, STARTING_BLOCK),
        fetchEvents(ethersProvider, cc20, cc20ReceivedFilter, STARTING_BLOCK),
        fetchEvents(ethersProvider, cc721, cc721SentFilter, STARTING_BLOCK),
        fetchEvents(ethersProvider, cc721, cc721ReceivedFilter, STARTING_BLOCK),
      ]);

      const allTheList = [
        ...cc20SentEvents,
        ...cc20ReceiveEvents,
        ...cc721SentEvents,
        ...cc721ReceiveEvents,
      ];

      const result = sortEvents(allTheList);
      setSortedEventList(result);
    } catch (error) {
      console.log(error);
    }
  }, [isConnected, address, STARTING_BLOCK, walletProvider, update]);
  useEffect(() => {
    setIsLoading(true);
    if (!address || !isConnected) {
      return setIsLoading(false);
    }
    getEvents().finally(() => {
      setIsLoading(false);
    });
  }, [isConnected, address, getEvents]);

  const eventItems = useMemo(() => {
    return sortedEventList
      .filter((v) => "args" in v)
      .map((v, i) => {
        const [from, to, amount] = Array.from((v as EventLog).args);

        const formattedAmount =
          v.address === CarbonCredit20Json.address
            ? `${convertUnit(ethers.formatEther(amount))} cc20`
            : `${amount} cc721`;
        if (amount === 0n) return;

        const etherScanLink = `https://sepolia.etherscan.io/tx/${v.transactionHash}`;
        if (isDesktop) {
          const status =
            from === ethers.ZeroAddress
              ? "🌟Mint🌟"
              : to === ethers.ZeroAddress
              ? "🔥Burn🔥"
              : "💸Transfer💸";
          return (
            <div
              key={i}
              className="w-full grid grid-cols-12 justify-center items-center text-center border-b-2 border-dashed border-[#4e4e4e] listBox py-1"
            >
              <p className="col-span-1">{i + 1}</p>
              <p className="col-span-2">{status}</p>
              <p className="col-span-2">
                {from.slice(0, addressRangeSlice[0])}...
                {from.slice(addressRangeSlice[1])}
              </p>
              <FaLongArrowAltRight className="text-green-600 subTitle w-full" />
              <p className="col-span-2">
                {to.slice(0, addressRangeSlice[0])}...
                {to.slice(addressRangeSlice[1])}
              </p>
              <p className="col-span-3">{formattedAmount}</p>
              <Link href={etherScanLink} target="blank">
                <button className="textBtn">Visit</button>
              </Link>
            </div>
          );
        } else {
          const status =
            from === ethers.ZeroAddress
              ? "🌟"
              : to === ethers.ZeroAddress
              ? "🔥"
              : "💸";
          return (
            <div
              key={i}
              className="w-full grid grid-cols-6 justify-center items-center text-center border-b-2 border-dashed border-[#4e4e4e] listBox py-1"
            >
              <p className="col-span-1">{i + 1}</p>
              <p className="col-span-1">{status}</p>
              <p className="col-span-3">{formattedAmount}</p>
              <Link href={etherScanLink} target="blank">
                <GoLink className="textIcon" />
              </Link>
            </div>
          );
        }
      });
  }, [sortedEventList, addressRangeSlice, isDesktop]);
  if (isLoading) {
    return (
      <div className="w-full flex flex-col justify-center">
        <div className="w-full flex flex-col box justify-center items-center boxWithScrollBar">
          <Loading />
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full flex flex-col justify-center">
        {isConnected ? (
          <div className="w-full flex flex-col box">
            {sortedEventList.length === 0 ? (
              <div className="boxWithScrollBar gap-3 flex flex-col mx-auto justify-center">
                <div className="flex flex-col justify-center items-center subTitle">
                  Empty
                </div>
              </div>
            ) : (
              <div className="innerBox boxWithScrollBar flex flex-col items-center">
                {eventItems}
              </div>
            )}
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
}

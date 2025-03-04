"use client";

import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useCallback, useContext, useEffect, useState } from "react";
import CarbonCredit721Json from "../../../abis/carbonCredit721.json";
import RouterJson from "../../../abis/router.json";
import UserStorageJson from "../../../abis/userStorage.json";
import { getContract } from "@/utils/provider";
import Image from "next/image";
import { ethers } from "ethers";
import { Eip1193Provider } from "ethers";
import { convertUnit } from "@/utils/utils";
import { ContextAPI, ContextType } from "@/contextAPI/websiteAPI";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";
import { toastMessage, txMessage } from "@/toastify/toastMessageStyle";
import Loading from "@/components/loading/loading";
import Link from "next/link";
export default function NFTBox() {
  const OPENSEA_URL = `https://testnets.opensea.io/assets/sepolia/${CarbonCredit721Json.address}`;
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [userNFTList, setUserNFTList] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [nftCreditAmount, setNftCreditAmount] = useState<bigint[]>([]);
  const context = (useContext(ContextAPI) || {}) as ContextType;
  const {
    setTxScreenOn = () => {},
    setUpdate = () => {},
    update = 0,
  } = context;

  useEffect(() => {
    setIsLoading(true);
    if (!address || !isConnected) {
      return setIsLoading(false);
    }

    const fetchUserNFTs = async () => {
      try {
        const contract = await getContract(
          CarbonCredit721Json.address,
          CarbonCredit721Json.abi
        );
        const tokensOfOwner = Array.from(await contract.tokensOfOwner(address));
        const creditByIds = Array.from(
          await contract.creditsByIds(tokensOfOwner)
        );

        setUserNFTList(tokensOfOwner as bigint[]);
        setNftCreditAmount(creditByIds as bigint[]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserNFTs().finally(() => {
      setIsLoading(false);
    });
  }, [address, isConnected, update]);

  const burn = useCallback(
    async (id: bigint) => {
      try {
        setTxScreenOn(true);
        const ethersProvider = new BrowserProvider(
          walletProvider as Eip1193Provider
        );
        const signer = await ethersProvider.getSigner();
        const router = new Contract(RouterJson.address, RouterJson.abi, signer);
        const cc721 = new Contract(
          CarbonCredit721Json.address,
          CarbonCredit721Json.abi,
          signer
        );
        const userStorage = new Contract(
          UserStorageJson.address,
          UserStorageJson.abi,
          signer
        );

        const isUserRegistered =
          Number(await userStorage.userStartedAt(address)) !== 0;

        if (!isUserRegistered) {
          toastMessage("Please Register", "warn");
          const tx = await userStorage.register();
          await txMessage(tx);
        }

        const isApproveAll = await cc721.isApprovedForAll(
          address,
          router.target
        );
        if (!isApproveAll) {
          toastMessage("Please approve", "warn");
          const tx = await cc721.setApprovalForAll(router.target, true);
          await txMessage(tx);
        }
        const tx = await router.burnCredit721(id);
        await txMessage(tx);
        setUpdate(new Date().getTime());
        setTxScreenOn(false);
      } catch (error) {
        console.error(error);
        setTxScreenOn(false);
      }
    },
    [address, setTxScreenOn, setUpdate, walletProvider]
  );
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
            {userNFTList.length === 0 ? (
              <div className="boxWithScrollBar gap-3 flex flex-col mx-auto justify-center">
                <div className=" flex flex-col justify-center items-center subTitle">
                  Empty
                </div>
              </div>
            ) : (
              <div className="innerBox boxWithScrollBar gap-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 mx-auto justify-center">
                {userNFTList.map((v, i) => (
                  <div
                    key={i}
                    className="nftBox font-bebas_neue w-full flex flex-col justify-center items-center gap-3"
                  >
                    <div className=" imageBox flex flex-col justify-center items-center">
                      <Image
                        src="/images/cc721.jpg"
                        fill={true}
                        alt="CC721 image"
                      />
                    </div>
                    <p className="mediumText">CC721 #{v}</p>
                    <p className="mediumText">
                      {convertUnit(
                        ethers.formatEther(String(nftCreditAmount[i]))
                      )}{" "}
                      CC20
                    </p>
                    <button className="btn w-full" onClick={() => burn(v)}>
                      Burn
                    </button>
                    <Link
                      className=" w-full"
                      href={`${OPENSEA_URL}/${v}`}
                      target="blank"
                    >
                      <button className="btn w-full">Go to Opensea</button>
                    </Link>
                  </div>
                ))}
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

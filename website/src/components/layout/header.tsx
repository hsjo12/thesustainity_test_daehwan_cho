"use client";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useCallback, useEffect, useState } from "react";

export default function Header() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [isNavOn, setIsNavOn] = useState(false);

  const handleScroll = useCallback(() => {
    setIsNavOn(window.scrollY > 50);
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  return (
    <div
      className={`w-full fixed top-0 left-0 flex z-50 pt-2 pb-2 ${
        isNavOn ? "bg-[#000000]" : ""
      }`}
    >
      <div className="w-[95%] mx-auto flex justify-between ">
        <h1 className="logo text-highlight">TheSustainity</h1>

        {isConnected ? (
          <button className="btn" onClick={() => open()}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </button>
        ) : (
          <button className="btn" onClick={() => open()}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

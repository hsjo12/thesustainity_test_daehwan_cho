"use client";
import { useContext, useEffect, useState } from "react";
import Footer from "./footer";
import Header from "./header";
import TxLoadingScreen from "../loading/txLoadingScreen";
import { ContextAPI } from "@/contextAPI/websiteAPI";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isClient, setIsClient] = useState(false);
  const context = useContext(ContextAPI);
  const txScreenOn = context?.txScreenOn ?? false;

  useEffect(() => {
    setIsClient(true);
  });
  if (!isClient) return;
  return (
    <div className="w-screen flex flex-col justify-center">
      {txScreenOn && <TxLoadingScreen />}
      <Header />
      <div className="min-h-screen mt-20 mb-5 w-[95%] mx-auto">{children}</div>
      <Footer />
    </div>
  );
}

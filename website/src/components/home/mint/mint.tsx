"use client";

import { useContext } from "react";
import CC20Box from "./cc20Box";
import CC721Box from "./cc721box";
import { ContextAPI, ContextType } from "@/contextAPI/websiteAPI";
export default function Mint() {
  const context = (useContext(ContextAPI) || {}) as ContextType;
  const { isDesktop = false } = context;

  return (
    <section className="w-full flex flex-col justify-center gap-3">
      {isDesktop ? (
        <h1 className="subTitle">
          Step 2: Mint (
          <span className="text-red-700">MANAGER_ROLE Required</span>)
        </h1>
      ) : (
        <div className="w-full flex flex-col subTitle">
          <h1>Step 2: Mint</h1>
          <h1>
            <span className="text-red-700">MANAGER_ROLE Required</span>
          </h1>
        </div>
      )}

      <p>
        Only users with the Manager Role can mint CC20 (CarbonCredit20) and
        CC721 (CarbonCredit721) by depositing CC20.
      </p>
      <div className="w-full grid  grid-cols-1 md:grid-cols-2 gap-3">
        <CC20Box />
        <CC721Box />
      </div>
    </section>
  );
}

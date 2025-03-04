"use client";

import { createContext, useState, ReactNode } from "react";
import { useMediaQuery } from "react-responsive";

export interface ContextType {
  isDesktop: boolean;
  txScreenOn: boolean;
  update: number;
  setUpdate: (value: number) => void;
  setTxScreenOn: (value: boolean) => void;
}
export const ContextAPI = createContext<ContextType | undefined>(undefined);

interface WebsiteAPIProps {
  children: ReactNode;
}
export function WebsiteAPI({ children }: WebsiteAPIProps) {
  const isDesktop = useMediaQuery({
    query: "(min-width:1224px)",
  });
  const [txScreenOn, setTxScreenOn] = useState<boolean>(false);
  const [update, setUpdate] = useState<number>(0);

  return (
    <ContextAPI.Provider
      value={{
        isDesktop,
        txScreenOn,
        setTxScreenOn,
        update,
        setUpdate,
      }}
    >
      {children}
    </ContextAPI.Provider>
  );
}

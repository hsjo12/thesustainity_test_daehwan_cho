import type { Metadata } from "next";
import { Bebas_Neue, Roboto, Fjalla_One } from "next/font/google";
import "../css/globals.css";
import "../css/texts.css";
import "../css/buttons.css";
import "../css/styles.css";
import "../css/animation.css";
import { WebsiteAPI } from "@/contextAPI/websiteAPI";
import { ToastContainer } from "react-toastify";
import Web3Modal from "@/rewon/web3Modal";
import Layout from "@/components/layout/layout";

const bebas_neue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--bebas_neue",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--roboto",
});

const fjalla_one = Fjalla_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--fjalla_one",
});

export const metadata: Metadata = {
  title: "TheSustainity",
  description: "Created By Daehwan",
  openGraph: {
    images: [
      {
        url: "https://ipfs.io/ipfs/bafybeic6dzrce7jsqjgxhycks2sufd4xvbiscwiuz6tquqqfpphjwvehoa", // Replace with your actual image URL
        width: 1200,
        height: 630,
        alt: "TheSustainity OG Image",
      },
    ],
  },
};
const cls = (...classNames: string[]): string => {
  return classNames.join(" ");
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cls(
          bebas_neue.variable,
          roboto.variable,
          fjalla_one.variable
        )}
      >
        <WebsiteAPI>
          <ToastContainer style={{ zIndex: 9999999 }} />
          <Web3Modal>
            <Layout>{children}</Layout>
          </Web3Modal>
        </WebsiteAPI>
      </body>
    </html>
  );
}

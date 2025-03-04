import NFTBox from "./nftbox";

export default function NFT() {
  return (
    <section className="w-full flex flex-col justify-center gap-3">
      <h1 className="subTitle">NFT Inventory</h1>
      <NFTBox />
    </section>
  );
}

import Register from "./register/register";
import Burn from "./burn/burn";
import Buy from "./buy/buy";
import Mint from "./mint/mint";
import NFT from "./nft/nft";
import Events from "./events/events";

export default function Structure() {
  return (
    <div className="w-full flex flex-col justify-center gap-4">
      <Register />
      <Mint />
      <Buy />
      <NFT />
      <Burn />
      <Events />
    </div>
  );
}

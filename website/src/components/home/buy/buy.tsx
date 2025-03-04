import BuyBox from "./buyBox";
import CC721Box from "../mint/cc721box";
export default function Buy() {
  return (
    <section className="w-full flex flex-col justify-center gap-3">
      <h1 className="subTitle">Step 3: Buy</h1>
      <p>
        Any user can buy CC20 (CarbonCredit20) and mint CC721 (CarbonCredit721)
        by depositing CC20.
      </p>
      <div className="w-full grid  grid-cols-1 md:grid-cols-2 gap-3">
        <BuyBox />
        <CC721Box />
      </div>
    </section>
  );
}

import UserCarbonInfo from "../register/userCarbonInfo";
import BurnBox from "./burnbox";

export default function Burn() {
  return (
    <section className="w-full flex flex-col justify-center gap-3">
      <h1 className="subTitle">Step 4: Burn</h1>
      <p>
        Any user can burn CC20 (CarbonCredit20) and CC721 (CarbonCredit721) to
        offset carbon emissions.
      </p>
      <div className="w-full grid  grid-cols-1 md:grid-cols-2 gap-3">
        <BurnBox />
        <UserCarbonInfo />
      </div>
    </section>
  );
}

import UserCarbonInfo from "./userCarbonInfo";
import UserInfo from "./userInfo";

export default function Register() {
  return (
    <section className="w-full flex flex-col justify-center gap-3">
      <h1 className="subTitle">Step1 : Registration</h1>
      <p>Register your company to display its current carbon emissions</p>

      <div className="w-full grid  grid-cols-1 md:grid-cols-2 gap-3">
        <UserInfo />
        <UserCarbonInfo />
      </div>
    </section>
  );
}

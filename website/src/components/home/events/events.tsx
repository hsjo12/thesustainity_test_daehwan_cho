import EventBox from "./eventsBox";

export default function Events() {
  return (
    <section className="w-full flex flex-col justify-center gap-3">
      <h1 className="subTitle">Events</h1>
      <p>Users can check their carbon credit reduction history.</p>
      <EventBox />
    </section>
  );
}

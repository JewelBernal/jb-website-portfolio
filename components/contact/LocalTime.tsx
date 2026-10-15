"use client";

import { useSyncExternalStore } from "react";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 10_000);
  return () => clearInterval(id);
}

// The static build has no visitor clock, so render a placeholder until hydration
export default function LocalTime() {
  const time = useSyncExternalStore(
    subscribe,
    () => formatter.format(new Date()),
    () => null,
  );

  return <span className="tabular-nums">{time ?? "--:--"}</span>;
}

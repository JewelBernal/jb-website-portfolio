"use client"

import dynamic from "next/dynamic"

// localStorage and "today" are browser-only, so skip prerendering the timesheet.
const Timesheet = dynamic(() => import("./Timesheet"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center p-8 font-mono text-sm text-muted-foreground">
      Loading timesheet…
    </div>
  ),
})

export default function TimesheetApp() {
  return <Timesheet />
}

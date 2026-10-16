"use client"

import dynamic from "next/dynamic"

// The timesheet lives in the URL fragment, which only the browser can read
const SharedTimesheet = dynamic(() => import("./SharedTimesheet"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center p-8 font-mono text-sm text-muted-foreground">
      Opening timesheet…
    </div>
  ),
})

export default function SharedTimesheetApp() {
  return <SharedTimesheet />
}

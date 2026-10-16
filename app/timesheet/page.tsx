import type { Metadata } from "next"

import TimesheetApp from "@/components/timesheet/TimesheetApp"

export const metadata: Metadata = {
  title: "Timesheet",
  robots: { index: false, follow: false },
}

export default function TimesheetPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <TimesheetApp />
    </main>
  )
}

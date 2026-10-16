import type { Metadata } from "next"

import SharedTimesheetApp from "@/components/timesheet/SharedTimesheetApp"

export const metadata: Metadata = {
  title: "Timesheet",
  robots: { index: false, follow: false },
  // Share links are private by possession; don't leak them to other sites
  referrer: "no-referrer",
}

export default function SharedTimesheetPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <SharedTimesheetApp />
    </main>
  )
}

"use client"

import { Download } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { formatMoney } from "@/components/invoice/types"
import { cn } from "@/lib/utils"

import { decodeShare } from "./share"
import type { SheetModel } from "./TimesheetDocument"
import type { InvoiceTheme } from "@/components/invoice/types"

const hours = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ""))

type State = { status: "loading" } | { status: "invalid" } | { status: "ready"; sheet: SheetModel; theme: InvoiceTheme }

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4 font-mono">
      <dt className="w-20 shrink-0 text-[11px] tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-[13px] whitespace-nowrap">{value}</dd>
    </div>
  )
}

// Read-only web view of a shared month, laid out like the PDF
export default function SharedTimesheet() {
  const [state, setState] = useState<State>({ status: "loading" })
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let cancelled = false
    decodeShare(window.location.hash).then((payload) => {
      if (cancelled) return
      setState(payload ? { status: "ready", ...payload } : { status: "invalid" })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center p-8 font-mono text-sm text-muted-foreground">
        Opening timesheet…
      </div>
    )
  }

  if (state.status === "invalid") {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <h1 className="text-lg font-semibold tracking-tight">This link doesn&apos;t contain a timesheet</h1>
        <p className="text-sm text-muted-foreground">
          It may have been cut off when it was copied. Ask for the link to be sent again.
        </p>
      </div>
    )
  }

  const { sheet, theme } = state
  const number = sheet.invoiceNumber.trim()
  const amount = sheet.total * sheet.rate

  async function downloadPdf() {
    setDownloading(true)
    try {
      const { downloadTimesheet } = await import("./TimesheetPdf")
      const logo = new URL("/logo.png", window.location.origin).href
      const file = `timesheet-${number || sheet.month.toLowerCase().replace(/\s+/g, "-")}.pdf`
      await downloadTimesheet(sheet, theme, { logo }, file)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted-foreground">Shared timesheet · read only</p>
        <Button variant="outline" onClick={downloadPdf} disabled={downloading}>
          <Download data-icon="inline-start" />
          {downloading ? "Generating…" : "Download PDF"}
        </Button>
      </div>

      <article className="rounded-xl bg-card px-5 py-8 ring-1 ring-foreground/10 sm:px-10 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <Image src="/logo.png" alt="" width={36} height={36} className="size-9 rounded-lg" />
          <h1 className="sr-only">Timesheet {sheet.month}</h1>
          <p className="font-mono text-xs tracking-wider text-muted-foreground">
            TIMESHEET <span className="text-foreground">#{number || "—"}</span>
          </p>
        </header>

        <dl className="mt-10 flex flex-col gap-2">
          <Fact label="PERIOD" value={sheet.period} />
          <Fact label="INVOICE" value={`#${number || "—"}`} />
          <Fact label="RATE" value={`£${formatMoney(sheet.rate)} / hr`} />
        </dl>

        <div className="mt-8 overflow-x-auto border-t pt-6">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-b font-mono text-[11px] tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 text-left font-normal">DATE</th>
                <th className="py-2 pr-4 text-left font-normal">DAY</th>
                <th className="py-2 pr-4 text-left font-normal">WORK SUMMARY</th>
                <th className="py-2 text-right font-normal">HOURS WORKED</th>
              </tr>
            </thead>
            <tbody>
              {sheet.days.map((day) => (
                <tr key={day.date} className="border-b align-top last:border-b-0">
                  <td className="py-2 pr-4 font-medium whitespace-nowrap">{day.date}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{day.weekday.toUpperCase()}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{day.note}</td>
                  <td className={cn("py-2 text-right font-mono", day.hours === null && "text-muted-foreground")}>
                    {day.hours === null ? "—" : hours(day.hours)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-6 ml-auto w-full max-w-60 font-mono text-xs">
          <div className="flex justify-between py-1">
            <dt className="tracking-wider text-muted-foreground">TOTAL HOURS</dt>
            <dd>{hours(sheet.total)}</dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className="tracking-wider text-muted-foreground">RATE</dt>
            <dd>{formatMoney(sheet.rate)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-amber-400 pt-3 text-amber-700 dark:text-amber-400">
            <dt className="tracking-wider">AMOUNT GBP</dt>
            <dd className="text-base font-medium">{formatMoney(amount)}</dd>
          </div>
        </dl>
      </article>
    </div>
  )
}

"use client"

import {
  ArrowUpRight,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Download,
  FileText,
  Link2,
  Moon,
  Sun,
} from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { shareUrl } from "./share"
import type { SheetAssets, SheetModel } from "./TimesheetDocument"
import {
  CURRENCY,
  INVOICE_STORAGE_KEY,
  STORAGE_KEY,
  formatHours,
  formatMoney,
  isInvalidHours,
  loadTimesheet,
  monthKey,
  monthLabel,
  nextNumber,
  parseHours,
  parseRate,
  rangeLabel,
  readStorage,
  shortMonthLabel,
  toTsv,
  toKey,
  workWeeks,
  type DayEntry,
  type TimesheetData,
} from "./utils"

// react-pdf is heavy, so it only loads once the preview is opened or a PDF is downloaded
const TimesheetPreview = dynamic(() => import("./TimesheetPdf"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[1/1.414] items-center justify-center rounded-xl bg-muted font-mono text-sm text-muted-foreground ring-1 ring-foreground/10">
      Loading preview…
    </div>
  ),
})

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-mono text-2xl font-medium tracking-tight">{value}</span>
        {detail ? <span className="text-xs text-muted-foreground">{detail}</span> : null}
      </CardContent>
    </Card>
  )
}

export default function Timesheet() {
  const [data, setData] = useState<TimesheetData>(loadTimesheet)
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [notice, setNotice] = useState<string>()
  const [view, setView] = useState<"log" | "preview">("log")
  const [downloading, setDownloading] = useState(false)
  const [sharedLink, setSharedLink] = useState<string>()
  const [logo, setLogo] = useState<string>()

  // Your JB mark (public/logo.png, the small copy used in the site header) keeps the PDF light
  useEffect(() => {
    const url = new URL("/logo.png", window.location.origin).href
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (res.ok && (res.headers.get("content-type") ?? "").startsWith("image/")) setLogo(url)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Storage can be full or blocked; the timesheet still works for this session.
    }
  }, [data])

  const todayKey = toKey(new Date())
  const weeks = useMemo(() => workWeeks(cursor.year, cursor.month), [cursor])
  const days = useMemo(() => weeks.flatMap((w) => w.days), [weeks])
  // Row position of each day, so Enter can move focus to the next one
  const rowIndex = useMemo(() => new Map(days.map((day, i) => [toKey(day), i])), [days])

  const hoursFor = (day: Date) => parseHours(data.entries[toKey(day)]?.hours ?? "") ?? 0
  const total = days.reduce((sum, day) => sum + hoursFor(day), 0)
  const loggedDays = days.filter((day) => parseHours(data.entries[toKey(day)]?.hours ?? "") !== null).length
  const defaultHours = parseHours(data.defaultHours) ?? 8
  const expected = days.length * defaultHours
  const progress = expected > 0 ? Math.min(1, total / expected) : 0
  const rate = parseRate(data.rate) ?? 0
  const amount = total * rate

  // Each month has its own invoice number; if it's blank, suggest the one after last month's
  const thisMonth = monthKey(cursor.year, cursor.month)
  const previous = new Date(cursor.year, cursor.month - 1, 1)
  const typedNumber = data.invoiceNumbers[thisMonth] ?? ""
  const suggestedNumber = nextNumber(data.invoiceNumbers[monthKey(previous.getFullYear(), previous.getMonth())] ?? "")
  const invoiceNumber = typedNumber.trim() || suggestedNumber

  const sheet = useMemo<SheetModel>(
    () => ({
      month: monthLabel(cursor.year, cursor.month),
      period: rangeLabel(days),
      invoiceNumber,
      days: days.map((day) => {
        const entry = data.entries[toKey(day)]
        return {
          date: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
          dayMonth: `${day.getDate()}/${day.getMonth() + 1}`,
          weekday: day.toLocaleDateString("en-GB", { weekday: "short" }),
          hours: parseHours(entry?.hours ?? ""),
          note: entry?.note ?? "",
        }
      }),
      total,
      loggedDays,
      workDays: days.length,
      rate,
    }),
    [cursor, days, data.entries, invoiceNumber, total, loggedDays, rate],
  )
  const assets = useMemo<SheetAssets>(() => ({ logo }), [logo])

  function shiftMonth(delta: number) {
    setNotice(undefined)
    setSharedLink(undefined)
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function goToToday() {
    const now = new Date()
    setNotice(undefined)
    setCursor({ year: now.getFullYear(), month: now.getMonth() })
  }

  function setEntry(key: string, patch: Partial<DayEntry>) {
    setData((prev) => {
      const next: DayEntry = { ...(prev.entries[key] ?? { hours: "", note: "" }), ...patch }
      const entries = { ...prev.entries }
      if (next.hours === "" && next.note === "") delete entries[key]
      else entries[key] = next
      return { ...prev, entries }
    })
  }

  // Fill every empty work day in this month (up to today, for the current month) with the default hours
  function fillWorkDays() {
    const fill = days.filter((day) => {
      const key = toKey(day)
      return key <= todayKey && !data.entries[key]?.hours
    })
    if (!fill.length) {
      setNotice("Every work day so far is already logged.")
      return
    }
    setData((prev) => {
      const entries = { ...prev.entries }
      for (const day of fill) {
        const key = toKey(day)
        entries[key] = { note: entries[key]?.note ?? "", hours: formatHours(defaultHours) }
      }
      return { ...prev, entries }
    })
    setNotice(`Filled ${fill.length} ${fill.length === 1 ? "day" : "days"} with ${formatHours(defaultHours)}h.`)
  }

  function savedInvoice(): Record<string, unknown> {
    try {
      return JSON.parse(readStorage(INVOICE_STORAGE_KEY) ?? "{}")
    } catch {
      return {} // a broken saved invoice is replaced by just the hours, rate and period
    }
  }

  async function downloadPdf() {
    setDownloading(true)
    try {
      const { downloadTimesheet } = await import("./TimesheetPdf")
      const file = `timesheet-${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}.pdf`
      await downloadTimesheet(sheet, data.theme, assets, file)
    } catch {
      setNotice("Couldn't generate the PDF. Try again in a moment.")
    } finally {
      setDownloading(false)
    }
  }

  // A read-only view for your manager; the month's data travels inside the link itself
  async function copyShareLink() {
    setSharedLink(undefined)
    try {
      const url = await shareUrl(sheet, data.theme)
      setSharedLink(url)
      await navigator.clipboard.writeText(url)
      setNotice(`Share link for ${sheet.month} copied. It's a snapshot — share a new link after editing.`)
    } catch {
      setNotice("Couldn't copy the link — the browser blocked clipboard access. Use Open to copy it from there.")
    }
  }

  async function copyForSheets() {
    try {
      await navigator.clipboard.writeText(toTsv(days, data.entries, total, rate))
      setNotice("Copied. Click a cell in Google Sheets and paste — it fills the columns.")
    } catch {
      setNotice("Couldn't copy — the browser blocked clipboard access.")
    }
  }

  function useInInvoice() {
    const invoice = savedInvoice()
    const period = shortMonthLabel(cursor.year, cursor.month)
    try {
      window.localStorage.setItem(
        INVOICE_STORAGE_KEY,
        JSON.stringify({
          ...invoice,
          hours: formatHours(total),
          rate: String(rate),
          period,
          ...(invoiceNumber && { invoiceNumber }),
        }),
      )
      setNotice(
        `Sent ${invoiceNumber ? `#${invoiceNumber}, ` : ""}${formatHours(total)}h at ${formatMoney(rate)}/hr for ${period} to the invoice generator.`,
      )
    } catch {
      setNotice("Couldn't save to the invoice generator — browser storage is blocked.")
    }
  }

  // Enter jumps to the next day's hours, for quick entry down the month
  function onHoursKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key !== "Enter") return
    e.preventDefault()
    document.getElementById(`hours-${index + 1}`)?.focus()
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
      <header className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Timesheet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Work days only. Saved in this browser — nothing is uploaded.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="PDF theme" className="flex rounded-lg bg-muted p-0.5">
            {(
              [
                { value: "light", label: "Light", Icon: Sun },
                { value: "dark", label: "Dark", Icon: Moon },
              ] as const
            ).map(({ value, label, Icon }) => (
              <Button
                key={value}
                variant={data.theme === value ? "outline" : "ghost"}
                aria-pressed={data.theme === value}
                onClick={() => setData((prev) => ({ ...prev, theme: value }))}
                className={cn("h-8", data.theme !== value && "text-muted-foreground")}
              >
                <Icon data-icon="inline-start" />
                {label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="lg" onClick={copyForSheets}>
            <ClipboardCopy data-icon="inline-start" />
            Copy for Sheets
          </Button>
          <Button variant="outline" size="lg" onClick={copyShareLink}>
            <Link2 data-icon="inline-start" />
            Share link
          </Button>
          <Button variant="outline" size="lg" onClick={downloadPdf} disabled={downloading}>
            <Download data-icon="inline-start" />
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
          <Button size="lg" onClick={useInInvoice} disabled={total === 0}>
            <FileText data-icon="inline-start" />
            Use in invoice
          </Button>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-lg" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-lg" aria-label="Next month" onClick={() => shiftMonth(1)}>
            <ChevronRight />
          </Button>
          <h2 className="ml-2 text-lg font-medium tracking-tight" aria-live="polite">
            {monthLabel(cursor.year, cursor.month)}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="invoice-number" className="text-xs font-normal text-muted-foreground">
            Invoice no.
          </Label>
          <Input
            id="invoice-number"
            placeholder={suggestedNumber || "00001"}
            value={typedNumber}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                invoiceNumbers: { ...prev.invoiceNumbers, [thisMonth]: e.target.value },
              }))
            }
            className="h-8 w-24 font-mono"
          />
          <Button variant="ghost" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" onClick={fillWorkDays}>
            <CalendarCheck data-icon="inline-start" />
            Fill work days
          </Button>
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-muted px-3 py-2 text-sm"
        >
          {notice}
          {sharedLink ? (
            <a
              href={sharedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
            >
              Open
              <ArrowUpRight className="size-3.5" />
            </a>
          ) : null}
          {notice.startsWith("Sent") ? (
            <Link
              href="/invoice"
              className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
            >
              Open invoice
              <ArrowUpRight className="size-3.5" />
            </Link>
          ) : null}
        </p>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Stat label="Total hours" value={`${formatHours(total)}h`} detail={`of ${formatHours(expected)}h expected`} />
        <Stat label="Days logged" value={`${loggedDays}/${days.length}`} detail="work days this month" />
        <Stat
          label="Daily average"
          value={`${loggedDays ? formatHours(Math.round((total / loggedDays) * 100) / 100) : "0"}h`}
          detail="across logged days"
        />
        <Card size="sm">
          <CardContent className="flex flex-col gap-1">
            <Label htmlFor="default-hours" className="text-xs font-normal text-muted-foreground">
              Default hours / day
            </Label>
            <Input
              id="default-hours"
              type="number"
              inputMode="decimal"
              min={0}
              max={24}
              step="0.5"
              value={data.defaultHours}
              aria-invalid={isInvalidHours(data.defaultHours) || undefined}
              onChange={(e) => setData((prev) => ({ ...prev, defaultHours: e.target.value }))}
              className="h-9 font-mono text-lg"
            />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col gap-1">
            <Label htmlFor="rate" className="text-xs font-normal text-muted-foreground">
              Rate ({CURRENCY} / hr)
            </Label>
            <Input
              id="rate"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.5"
              value={data.rate}
              aria-invalid={(data.rate.trim() !== "" && parseRate(data.rate) === null) || undefined}
              onChange={(e) => setData((prev) => ({ ...prev, rate: e.target.value }))}
              className="h-9 font-mono text-lg"
            />
            <span className="text-xs text-muted-foreground">
              <span className="font-mono font-medium text-foreground">{formatMoney(amount)}</span> for{" "}
              {formatHours(total)}h
            </span>
          </CardContent>
        </Card>
      </div>

      <div
        role="progressbar"
        aria-label="Hours logged against expected"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="mb-8 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div role="tablist" aria-label="View" className="mb-4 flex w-fit rounded-lg bg-muted p-0.5">
        {(
          [
            { value: "log", label: "Log hours" },
            { value: "preview", label: "Preview PDF" },
          ] as const
        ).map(({ value, label }) => (
          <Button
            key={value}
            role="tab"
            aria-selected={view === value}
            variant={view === value ? "outline" : "ghost"}
            onClick={() => setView(value)}
            className={cn("h-8", view !== value && "text-muted-foreground")}
          >
            {label}
          </Button>
        ))}
      </div>

      {view === "preview" ? (
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <TimesheetPreview sheet={sheet} theme={data.theme} assets={assets} />
        </div>
      ) : (
        <Card className="py-0">
          <CardHeader className="sr-only">
            <CardTitle>Days</CardTitle>
            <CardDescription>Hours and notes for each work day</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="hidden grid-cols-[9rem_6rem_minmax(0,1fr)] gap-4 border-b px-4 py-2.5 text-xs text-muted-foreground sm:grid">
              <span>Day</span>
              <span>Hours</span>
              <span>Work summary</span>
            </div>
            {weeks.map((week) => {
              const weekTotal = week.days.reduce((sum, day) => sum + hoursFor(day), 0)
              return (
                <section key={week.week} aria-label={`Week ${week.week}`} className="border-b last:border-b-0">
                  <div className="flex items-center justify-between bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
                    <span className="font-mono">Week {week.week}</span>
                    <span className="font-mono">{formatHours(weekTotal)}h</span>
                  </div>
                  {week.days.map((day) => {
                    const key = toKey(day)
                    const index = rowIndex.get(key) ?? 0
                    const entry = data.entries[key]
                    const isToday = key === todayKey
                    const isFuture = key > todayKey
                    const invalid = isInvalidHours(entry?.hours ?? "")
                    return (
                      <div
                        key={key}
                        className={cn(
                          "grid grid-cols-[minmax(0,1fr)_6rem] items-center gap-x-4 gap-y-2 border-t px-4 py-2.5 first:border-t-0 sm:grid-cols-[9rem_6rem_minmax(0,1fr)]",
                          isToday && "bg-muted/40",
                          isFuture && !entry && "text-muted-foreground",
                        )}
                      >
                        <label htmlFor={`hours-${index}`} className="flex items-center gap-2 text-sm">
                          <span className="w-8 font-mono text-xs text-muted-foreground">
                            {day.toLocaleDateString("en-GB", { weekday: "short" })}
                          </span>
                          <span className="font-medium">
                            {day.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                          {isToday ? (
                            <span className="rounded-full bg-foreground px-1.5 py-px text-[10px] font-medium text-background">
                              Today
                            </span>
                          ) : null}
                        </label>
                        <Input
                          id={`hours-${index}`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={24}
                          step="0.25"
                          placeholder="—"
                          value={entry?.hours ?? ""}
                          aria-invalid={invalid || undefined}
                          onChange={(e) => setEntry(key, { hours: e.target.value })}
                          onKeyDown={(e) => onHoursKeyDown(e, index)}
                          className="h-8 font-mono"
                        />
                        <Input
                          aria-label={`Work summary for ${day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`}
                          placeholder="What did you work on?"
                          value={entry?.note ?? ""}
                          onChange={(e) => setEntry(key, { note: e.target.value })}
                          className="col-span-2 h-8 sm:col-span-1"
                        />
                      </div>
                    )
                  })}
                </section>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="mt-4 flex items-center justify-between px-1 text-sm">
        <span className="text-muted-foreground">Total for {monthLabel(cursor.year, cursor.month)}</span>
        <span className="font-mono font-medium">
          {formatHours(total)}h · {formatMoney(amount)}
        </span>
      </div>
    </div>
  )
}

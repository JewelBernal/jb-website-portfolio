export type DayEntry = {
  hours: string // kept as typed, so "7.5" or "" round-trips through the input
  note: string
}

export type TimesheetData = {
  theme: "light" | "dark" // PDF theme, matching the invoice generator's options
  defaultHours: string
  rate: string // GBP per hour
  invoiceNumbers: Record<string, string> // keyed by yyyy-mm, shared with that month's invoice
  entries: Record<string, DayEntry> // keyed by yyyy-mm-dd
}

export const STORAGE_KEY = "timesheet:v1"
// The invoice generator's saved form; "Use in invoice" writes hours, rate, period and number into it
export const INVOICE_STORAGE_KEY = "invoice-generator:v1"

export const CURRENCY = "GBP"

export const emptyTimesheet: TimesheetData = {
  theme: "light",
  defaultHours: "8",
  rate: "7",
  invoiceNumbers: {},
  entries: {},
}

export function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage can be full or blocked; the timesheet still works for this session.
  }
}

function parse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return { ...fallback, ...(JSON.parse(json) as Partial<T>) }
  } catch {
    return fallback
  }
}

export function loadTimesheet(): TimesheetData {
  return parse(readStorage(STORAGE_KEY), emptyTimesheet)
}

export const monthKey = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, "0")}`

// "00001" → "00002", keeping the zero padding; empty when there's nothing to count on from
export function nextNumber(previous: string) {
  const match = previous.trim().match(/^(.*?)(\d+)$/)
  if (!match) return ""
  const [, prefix, digits] = match
  return prefix + String(Number(digits) + 1).padStart(digits.length, "0")
}

export function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

// Hours as a number, or null when empty or not a valid 0–24 value
export function parseHours(value: string): number | null {
  if (value.trim() === "") return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 && n <= 24 ? n : null
}

export function parseRate(value: string): number | null {
  if (value.trim() === "") return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function formatMoney(n: number) {
  return n.toLocaleString("en-GB", { style: "currency", currency: CURRENCY })
}

export function isInvalidHours(value: string) {
  return value.trim() !== "" && parseHours(value) === null
}

export function formatHours(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "")
}

// ISO 8601 week number, used to group days into weeks
export function isoWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// Monday–Friday of the given month, grouped by ISO week
export function workWeeks(year: number, month: number) {
  const weeks: { week: number; days: Date[] }[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    const weekday = date.getDay()
    if (weekday !== 0 && weekday !== 6) {
      const week = isoWeek(date)
      const last = weeks.at(-1)
      if (last?.week === week) last.days.push(new Date(date))
      else weeks.push({ week, days: [new Date(date)] })
    }
    date.setDate(date.getDate() + 1)
  }
  return weeks
}

export const monthLabel = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })

export const shortMonthLabel = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" })

// Tab-separated rows: pasting into Google Sheets splits them into cells
export function toTsv(days: Date[], entries: Record<string, DayEntry>, total: number, rate: number) {
  const clean = (value: string) => value.replace(/[\t\n]+/g, " ")
  const rows = [["Date", "Day", "Hours", "Note"]]
  for (const day of days) {
    const entry = entries[toKey(day)]
    const hours = parseHours(entry?.hours ?? "")
    rows.push([
      toKey(day),
      day.toLocaleDateString("en-GB", { weekday: "short" }),
      hours === null ? "" : formatHours(hours),
      clean(entry?.note ?? ""),
    ])
  }
  rows.push([], ["Total hours", "", formatHours(total), ""])
  rows.push([`Rate (${CURRENCY} / hr)`, "", String(rate), ""])
  rows.push([`Amount (${CURRENCY})`, "", (total * rate).toFixed(2), ""])
  return rows.map((row) => row.join("\t")).join("\n")
}

export const rangeLabel = (days: Date[]) => {
  if (!days.length) return "—"
  const first = days[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  const last = days[days.length - 1].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  return `${first} – ${last}`
}

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

// Importing the invoice document also registers the Geist fonts
import { palettes, type Palette } from "@/components/invoice/InvoiceDocument"
import { formatMoney } from "@/components/invoice/types"
import type { InvoiceTheme } from "@/components/invoice/types"

export type SheetDay = {
  date: string // "1 Oct"
  dayMonth?: string // "1/10"; optional so share links made before it still open
  weekday: string
  hours: number | null
  note: string
}

export type SheetModel = {
  month: string // "October 2026"
  period: string // "1 Oct – 30 Oct 2026"
  invoiceNumber: string // shared with the invoice for the same month
  days: SheetDay[]
  total: number
  loggedDays: number
  workDays: number
  rate: number
}

export type SheetAssets = { logo?: string }

const PAD = 42

// Pick the table layout:
//   "lines"  — hairline rows
//   "bars"   — zebra rows with an hours bar per day
//   "ledger" — receipt-style rows with dotted leaders to the hours
//   "table"  — a bordered shadcn/ui-style table with header and footer rows
const TABLE_DESIGN: "lines" | "bars" | "ledger" | "table" = "table"
const BAR_WIDTH = 64

const hours = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ""))

// Blend two #rrggbb colours; used for the table's zebra stripes
function mix(a: string, b: string, amount: number) {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return `#${[0, 1, 2]
    .map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * amount).toString(16).padStart(2, "0"))
    .join("")}`
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    page: {
      fontFamily: "Geist",
      fontSize: 8.5,
      color: c.text,
      backgroundColor: c.page,
      paddingHorizontal: PAD,
      paddingTop: 34,
      paddingBottom: 34,
    },

    top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    logoTile: { width: 30, height: 30, borderRadius: 6, backgroundColor: c.tile, padding: 4 },
    logo: { width: 22, height: 22, objectFit: "contain" },
    docTag: { flexDirection: "row", alignItems: "center" },
    docTagText: { fontFamily: "Geist Mono", fontSize: 7.5, color: c.muted, letterSpacing: 1 },
    docTagValue: { fontFamily: "Geist Mono", fontSize: 7.5, color: c.text, letterSpacing: 1 },

    // Facts stacked as a label / value list under the header
    facts: { marginTop: 28 },
    fact: { flexDirection: "row", alignItems: "baseline", marginBottom: 5 },
    factLabel: { fontFamily: "Geist Mono", fontSize: 6.5, color: c.faint, letterSpacing: 1.2, width: 64 },
    factValue: { fontFamily: "Geist Mono", fontSize: 8.5, color: c.text },

    rule: { borderBottomWidth: 0.75, borderBottomColor: c.line, marginTop: 20, marginBottom: 16 },

    tableHead: {
      flexDirection: "row",
      paddingHorizontal: 6,
      paddingBottom: 8,
      borderBottomWidth: 0.75,
      borderBottomColor: c.line,
    },
    th: { fontFamily: "Geist Mono", fontSize: 6.5, color: c.faint, letterSpacing: 1.2 },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 5,
      paddingHorizontal: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: c.line,
    },
    colDate: { width: 62 },
    colDay: { width: 34 },
    colNote: { flex: 1, paddingRight: 12 },
    colHours: { width: 70, textAlign: "right" },
    date: { fontSize: 8, fontWeight: 500 },
    day: { fontFamily: "Geist Mono", fontSize: 7, color: c.muted },
    note: { fontSize: 7.5, color: c.muted, lineHeight: 1.35 },
    num: { fontFamily: "Geist Mono", fontSize: 8 },
    empty: { fontFamily: "Geist Mono", fontSize: 8, color: c.faint },

    // "bars" table
    barHead: { flexDirection: "row", paddingHorizontal: 8, paddingBottom: 7 },
    barRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4.5, paddingHorizontal: 8, borderRadius: 3 },
    barRowAlt: { backgroundColor: c.panel },
    barDate: { width: 72, flexDirection: "row", alignItems: "baseline" },
    barDayNum: { fontFamily: "Geist Mono", fontSize: 9, fontWeight: 500, width: 37 },
    barWeekday: { fontFamily: "Geist Mono", fontSize: 6.5, color: c.muted, letterSpacing: 0.8 },
    barNote: { flex: 1, fontSize: 7.5, color: c.muted, lineHeight: 1.35, paddingRight: 12 },
    barCell: { width: BAR_WIDTH + 36, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
    barTrack: { width: BAR_WIDTH, height: 4, borderRadius: 2, backgroundColor: c.line, marginRight: 8 },
    barFill: { height: 4, borderRadius: 2, backgroundColor: c.accent },
    barValue: { fontFamily: "Geist Mono", fontSize: 8, width: 26, textAlign: "right" },
    barValueEmpty: { fontFamily: "Geist Mono", fontSize: 8, width: 26, textAlign: "right", color: c.faint },
    barFaded: { opacity: 0.55 },

    // "ledger" table
    ledgerHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: 8,
      marginBottom: 4,
      borderBottomWidth: 0.75,
      borderBottomColor: c.text,
    },
    ledgerRow: { flexDirection: "row", alignItems: "flex-end", paddingVertical: 4.6 },
    ledgerDate: { width: 72, flexDirection: "row", alignItems: "baseline" },
    ledgerDayMonth: { fontFamily: "Geist Mono", fontSize: 8.5, fontWeight: 500, width: 37 },
    ledgerWeekday: { fontFamily: "Geist Mono", fontSize: 6.5, color: c.muted, letterSpacing: 0.8 },
    ledgerNote: { fontSize: 8, color: c.text, maxWidth: 330, lineHeight: 1.35 },
    ledgerLeader: {
      flex: 1,
      borderBottomWidth: 0.9,
      borderBottomColor: c.faint,
      borderStyle: "dotted",
      marginHorizontal: 6,
      marginBottom: 2.5,
    },
    ledgerHours: { fontFamily: "Geist Mono", fontSize: 8.5, width: 34, textAlign: "right" },
    ledgerEmpty: { opacity: 0.4 },
    ledgerFoot: { borderTopWidth: 0.75, borderTopColor: c.text, marginTop: 4 },

    // "table" design, after shadcn/ui's Table
    table: { borderWidth: 0.75, borderColor: c.line, borderRadius: 6, overflow: "hidden" },
    tHeadRow: { flexDirection: "row", backgroundColor: c.panel, borderBottomWidth: 0.75, borderBottomColor: c.line },
    tRow: { flexDirection: "row", alignItems: "stretch", borderBottomWidth: 0.5, borderBottomColor: c.line },
    tRowLast: { borderBottomWidth: 0 },
    // Halfway between the page and the header tint, so stripes stay quieter than the header
    tRowStripe: { backgroundColor: mix(c.page, c.panel, 0.55) },
    tFootRow: { flexDirection: "row", backgroundColor: c.panel, borderTopWidth: 0.75, borderTopColor: c.line },
    tCell: { paddingVertical: 5.5, paddingHorizontal: 9 },
    tHeadCell: { paddingVertical: 7, paddingHorizontal: 9 },
    tHead: { fontSize: 7.5, fontWeight: 500, color: c.muted },
    // Vertical rule after every column but the last, so rows read as cells
    tCellLine: { borderRightWidth: 0.5, borderRightColor: c.line },
    tColDate: { width: 62 },
    tColDay: { width: 44 },
    tColNote: { flex: 1 },
    tColHours: { width: 82, textAlign: "right" },
    tDate: { fontSize: 8, fontWeight: 500 },
    tDay: { fontSize: 8, color: c.muted },
    tNote: { fontSize: 8, color: c.text, lineHeight: 1.35 },
    tHours: { fontSize: 8, fontWeight: 500, textAlign: "right" },
    tMuted: { fontSize: 8, color: c.faint, textAlign: "right" },
    tFootLabel: { fontSize: 8, fontWeight: 600 },
    tFootValue: { fontSize: 8, fontWeight: 600, textAlign: "right" },

    totals: { alignSelf: "flex-end", width: 206, marginTop: 14 },
    totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
    totalLabel: { fontFamily: "Geist Mono", fontSize: 7, color: c.muted, letterSpacing: 0.8 },
    totalValue: { fontFamily: "Geist Mono", fontSize: 8.5 },
    grandLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 6,
      paddingTop: 9,
      borderTopWidth: 0.75,
      borderTopColor: c.accent,
    },
    grandLabel: { fontFamily: "Geist Mono", fontSize: 7, color: c.accentText, letterSpacing: 0.8 },
    grandValue: { fontFamily: "Geist Mono", fontSize: 10.5, fontWeight: 500, color: c.accentText },
  })
}

const themes = { dark: makeStyles(palettes.dark), light: makeStyles(palettes.light) }
type Styles = (typeof themes)["light"]

function LinesTable({ s, days }: { s: Styles; days: SheetDay[] }) {
  return (
    <>
      <View style={s.tableHead}>
        <Text style={[s.th, s.colDate]}>DATE</Text>
        <Text style={[s.th, s.colDay]}>DAY</Text>
        <Text style={[s.th, s.colNote]}>WORK SUMMARY</Text>
        <Text style={[s.th, s.colHours]}>HOURS WORKED</Text>
      </View>
      {days.map((day) => (
        <View key={day.date} style={s.row} wrap={false}>
          <Text style={[s.date, s.colDate]}>{day.date}</Text>
          <Text style={[s.day, s.colDay]}>{day.weekday.toUpperCase()}</Text>
          <Text style={[s.note, s.colNote]}>{day.note || " "}</Text>
          <Text style={[day.hours === null ? s.empty : s.num, s.colHours]}>
            {day.hours === null ? "—" : hours(day.hours)}
          </Text>
        </View>
      ))}
    </>
  )
}

// Row sizes from roomiest to tightest; the table uses the first one that fits on one A4 page
const DENSITIES = [
  { pad: 5.5, font: 8 },
  { pad: 4, font: 7.5 },
  { pad: 2.8, font: 7 },
  { pad: 1.8, font: 6.5 },
]
// Height left for the day rows once the header, facts, table header/footer and totals are placed
const ROW_BUDGET = 515
// Width of the work summary column in points (A4 content width minus the other columns and padding)
const NOTE_WIDTH = 305

// Estimate the table's height, counting notes that wrap onto extra lines
function fitDensity(days: SheetDay[]) {
  for (const density of DENSITIES) {
    const charsPerLine = NOTE_WIDTH / (density.font * 0.52)
    const height = days.reduce((sum, day) => {
      const lines = Math.max(1, Math.ceil(day.note.length / charsPerLine))
      return sum + density.pad * 2 + lines * density.font * 1.35 + 0.5
    }, 0)
    if (height <= ROW_BUDGET) return density
  }
  return DENSITIES[DENSITIES.length - 1]
}

// Bordered table with a muted header and a total footer, like shadcn/ui's <Table>
function ShadcnTable({ s, days, total }: { s: Styles; days: SheetDay[]; total: number }) {
  const { pad, font } = fitDensity(days)
  const cell = { paddingVertical: pad }
  const text = { fontSize: font }
  return (
    <View style={s.table}>
      <View style={s.tHeadRow}>
        <Text style={[s.tHeadCell, s.tColDate, s.tCellLine, s.tHead]}>Date</Text>
        <Text style={[s.tHeadCell, s.tColDay, s.tCellLine, s.tHead]}>Day</Text>
        <Text style={[s.tHeadCell, s.tColNote, s.tCellLine, s.tHead]}>Work summary</Text>
        <Text style={[s.tHeadCell, s.tColHours, s.tHead, { textAlign: "right" }]}>Hours worked</Text>
      </View>
      {days.map((day, i) => (
        <View
          key={day.date}
          style={[s.tRow, i % 2 === 1 ? s.tRowStripe : {}, i === days.length - 1 ? s.tRowLast : {}]}
          wrap={false}
        >
          <Text style={[s.tCell, cell, s.tColDate, s.tCellLine, s.tDate, text]}>{day.dayMonth ?? day.date}</Text>
          <Text style={[s.tCell, cell, s.tColDay, s.tCellLine, s.tDay, text]}>{day.weekday}</Text>
          <Text style={[s.tCell, cell, s.tColNote, s.tCellLine, s.tNote, text]}>{day.note || " "}</Text>
          <Text style={[s.tCell, cell, s.tColHours, day.hours === null ? s.tMuted : s.tHours, text]}>
            {day.hours === null ? "—" : hours(day.hours)}
          </Text>
        </View>
      ))}
      {/* Same columns as the rows, so the vertical rules run unbroken to the bottom */}
      <View style={s.tFootRow}>
        <Text style={[s.tCell, s.tColDate, s.tCellLine, s.tFootLabel]}>Total</Text>
        <Text style={[s.tCell, s.tColDay, s.tCellLine]}> </Text>
        <Text style={[s.tCell, s.tColNote, s.tCellLine]}> </Text>
        <Text style={[s.tCell, s.tColHours, s.tFootValue]}>{hours(total)}</Text>
      </View>
    </View>
  )
}

// Receipt-style: date, summary, then a dotted leader running to the hours
function LedgerTable({ s, days }: { s: Styles; days: SheetDay[] }) {
  return (
    <>
      <View style={s.ledgerHead}>
        <View style={{ flexDirection: "row" }}>
          <Text style={[s.th, { width: 72 }]}>DATE · DAY</Text>
          <Text style={s.th}>WORK SUMMARY</Text>
        </View>
        <Text style={s.th}>HOURS WORKED</Text>
      </View>
      {days.map((day) => {
        const logged = day.hours !== null
        return (
          <View key={day.date} style={[s.ledgerRow, logged ? {} : s.ledgerEmpty]} wrap={false}>
            <View style={s.ledgerDate}>
              <Text style={s.ledgerDayMonth}>{day.dayMonth ?? day.date.split(" ")[0]}</Text>
              <Text style={s.ledgerWeekday}>{day.weekday.toUpperCase()}</Text>
            </View>
            {day.note ? <Text style={s.ledgerNote}>{day.note}</Text> : null}
            <View style={s.ledgerLeader} />
            <Text style={s.ledgerHours}>{logged ? (day.hours ?? 0).toFixed(2) : "—"}</Text>
          </View>
        )
      })}
      <View style={s.ledgerFoot} />
    </>
  )
}

// Zebra rows; the bar shows each day against a full day (8h, or the month's longest day)
function BarsTable({ s, days }: { s: Styles; days: SheetDay[] }) {
  const scale = Math.max(8, ...days.map((day) => day.hours ?? 0))
  return (
    <>
      <View style={s.barHead}>
        <Text style={[s.th, { width: 72 }]}>DATE · DAY</Text>
        <Text style={[s.th, { flex: 1 }]}>WORK SUMMARY</Text>
        <Text style={[s.th, { width: BAR_WIDTH + 36, textAlign: "right" }]}>HOURS WORKED</Text>
      </View>
      {days.map((day, i) => {
        const dayMonth = day.dayMonth ?? day.date.split(" ")[0]
        const logged = day.hours !== null
        return (
          <View key={day.date} style={[s.barRow, i % 2 === 0 ? s.barRowAlt : {}]} wrap={false}>
            <View style={[s.barDate, logged ? {} : s.barFaded]}>
              <Text style={s.barDayNum}>{dayMonth}</Text>
              <Text style={s.barWeekday}>{day.weekday.toUpperCase()}</Text>
            </View>
            <Text style={s.barNote}>{day.note || " "}</Text>
            <View style={s.barCell}>
              <View style={s.barTrack}>
                {logged ? (
                  <View style={[s.barFill, { width: (BAR_WIDTH * Math.min(day.hours ?? 0, scale)) / scale }]} />
                ) : null}
              </View>
              <Text style={logged ? s.barValue : s.barValueEmpty}>{logged ? hours(day.hours ?? 0) : "—"}</Text>
            </View>
          </View>
        )
      })}
    </>
  )
}

export function TimesheetDocument({
  sheet,
  theme,
  assets,
}: {
  sheet: SheetModel
  theme: InvoiceTheme
  assets: SheetAssets
}) {
  const s = themes[theme === "dark" ? "dark" : "light"]
  const amount = sheet.total * sheet.rate
  const number = sheet.invoiceNumber.trim()

  return (
    <Document title={`Timesheet ${number ? `#${number} ` : ""}${sheet.month}`} subject={`Timesheet for ${sheet.month}`}>
      <Page size="A4" style={s.page}>
        <View style={s.top}>
          {assets.logo ? (
            <View style={s.logoTile}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
              <Image src={assets.logo} style={s.logo} />
            </View>
          ) : (
            <View />
          )}
          <View style={s.docTag}>
            <Text style={s.docTagText}>TIMESHEET </Text>
            <Text style={s.docTagValue}>#{number || "—"}</Text>
          </View>
        </View>

        <View style={s.facts}>
          {[
            ["PERIOD", sheet.period],
            ["INVOICE", `#${number || "—"}`],
            ["RATE", `£${formatMoney(sheet.rate)} / hr`],
          ].map(([label, value]) => (
            <View key={label} style={s.fact}>
              <Text style={s.factLabel}>{label}</Text>
              <Text style={s.factValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={s.rule} />

        {TABLE_DESIGN === "table" ? (
          <ShadcnTable s={s} days={sheet.days} total={sheet.total} />
        ) : TABLE_DESIGN === "ledger" ? (
          <LedgerTable s={s} days={sheet.days} />
        ) : TABLE_DESIGN === "bars" ? (
          <BarsTable s={s} days={sheet.days} />
        ) : (
          <LinesTable s={s} days={sheet.days} />
        )}

        <View style={s.totals} wrap={false}>
          {/* The "table" design already shows the total in its footer row */}
          {TABLE_DESIGN !== "table" ? (
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>TOTAL HOURS</Text>
              <Text style={s.totalValue}>{hours(sheet.total)}</Text>
            </View>
          ) : null}
          <View style={s.totalLine}>
            <Text style={s.totalLabel}>RATE</Text>
            <Text style={s.totalValue}>{formatMoney(sheet.rate)}</Text>
          </View>
          <View style={s.grandLine}>
            <Text style={s.grandLabel}>AMOUNT GBP</Text>
            <Text style={s.grandValue}>{formatMoney(amount)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

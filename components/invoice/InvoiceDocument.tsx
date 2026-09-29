import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import {
  CURRENCY,
  formatDate,
  formatMoney,
  toNumber,
  type InvoiceAssets,
  type InvoiceData,
  type InvoiceTheme,
} from "./types"

// This module is only ever loaded in the browser, so fonts resolve against the current origin.
const fontUrl = (file: string) => new URL(`/invoice/fonts/${file}`, window.location.origin).href

Font.register({
  family: "Geist",
  fonts: [
    { src: fontUrl("Geist-Regular.ttf"), fontWeight: 400 },
    { src: fontUrl("Geist-Medium.ttf"), fontWeight: 500 },
    { src: fontUrl("Geist-SemiBold.ttf"), fontWeight: 600 },
  ],
})
Font.register({
  family: "Geist Mono",
  fonts: [
    { src: fontUrl("GeistMono-Regular.ttf"), fontWeight: 400 },
    { src: fontUrl("GeistMono-Medium.ttf"), fontWeight: 500 },
  ],
})
// Keep IBANs, emails and addresses from being hyphenated mid-word.
Font.registerHyphenationCallback((word) => [word])

type Palette = {
  page: string
  panel: string
  text: string
  muted: string
  faint: string
  line: string
  accent: string // fills and rules
  accentText: string // accent used as text, kept readable on the page colour
  onAccent: string
  tile: string // backdrop for the logo
  band: string // paper strip behind the signature
  bandText: string
  bandMuted: string
}

const palettes: Record<InvoiceTheme, Palette> = {
  dark: {
    page: "#0d0e10",
    panel: "#15171a",
    text: "#ecebe7",
    muted: "#85878c",
    faint: "#55585e",
    line: "#25282c",
    accent: "#f5b041",
    accentText: "#f5b041",
    onAccent: "#0d0e10",
    tile: "#efece4",
    band: "#efece4",
    bandText: "#17181a",
    bandMuted: "#6f6c64",
  },
  // Print-friendly: same layout, dark text on warm off-white.
  light: {
    page: "#faf8f4",
    panel: "#f2efe8",
    text: "#16171a",
    muted: "#5d5f64",
    faint: "#8a8c91",
    line: "#e0dcd3",
    accent: "#f5b041",
    accentText: "#9a5d00",
    onAccent: "#16171a",
    tile: "#ffffff",
    band: "#ebe7dd",
    bandText: "#16171a",
    bandMuted: "#6f6c64",
  },
}


const PAD = 42
const BAND = 128

function makeStyles(c: Palette) {
  return StyleSheet.create({
    page: {
      fontFamily: "Geist",
      fontSize: 8.5,
      color: c.text,
      backgroundColor: c.page,
      paddingHorizontal: PAD,
      paddingTop: 34,
      paddingBottom: BAND + 22,
    },

    // Top bar
    top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    brand: { flexDirection: "row", alignItems: "center" },
    mark: {
      width: 30,
      height: 30,
      borderRadius: 6,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },
    markText: { fontFamily: "Geist Mono", fontSize: 11, fontWeight: 500, color: c.onAccent },
    logoTile: {
      width: 30,
      height: 30,
      borderRadius: 6,
      backgroundColor: c.tile,
      padding: 4,
      marginRight: 11,
    },
    logo: { width: 22, height: 22, objectFit: "contain" },
    name: { fontSize: 10, fontWeight: 600 },
    tagline: { fontSize: 7, color: c.muted, marginTop: 2.5 },
    docTag: { flexDirection: "row", alignItems: "center" },
    docTagText: { fontFamily: "Geist Mono", fontSize: 7.5, color: c.muted, letterSpacing: 1 },
    docTagNumber: { fontFamily: "Geist Mono", fontSize: 7.5, color: c.text, letterSpacing: 1 },

    // Hero
    hero: { marginTop: 32, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    kicker: { fontFamily: "Geist Mono", fontSize: 7, color: c.accentText, letterSpacing: 1.2, marginBottom: 10 },
    amountRow: { flexDirection: "row", alignItems: "flex-end" },
    amount: { fontSize: 46, fontWeight: 600, letterSpacing: -1.8, lineHeight: 1 },
    cursor: { width: 16, height: 36, backgroundColor: c.accent, marginLeft: 6, marginBottom: 4 },
    currency: { fontFamily: "Geist Mono", fontSize: 10, color: c.muted, marginLeft: 10, marginBottom: 6 },
    dates: { alignItems: "flex-end" },
    dateRow: { flexDirection: "row", marginTop: 5 },
    dateLabel: { fontFamily: "Geist Mono", fontSize: 7, color: c.faint, width: 46, letterSpacing: 0.8 },
    dateValue: { fontFamily: "Geist Mono", fontSize: 7.5, color: c.text, width: 72, textAlign: "right" },

    rule: { borderBottomWidth: 0.75, borderBottomColor: c.line, marginVertical: 20 },

    // Parties
    parties: { flexDirection: "row" },
    party: { flex: 1, paddingRight: 20 },
    label: { fontFamily: "Geist Mono", fontSize: 6.5, color: c.faint, letterSpacing: 1.2, marginBottom: 9 },
    partyName: { fontSize: 11, fontWeight: 600 },
    partyContact: { fontSize: 7.5, color: c.accentText, marginTop: 3 },
    partyLine: { fontSize: 7.5, color: c.muted, lineHeight: 1.5, marginTop: 6 },
    partyMono: { fontFamily: "Geist Mono", fontSize: 7, color: c.muted, marginTop: 3 },

    // Line item
    tableHead: { flexDirection: "row", paddingBottom: 9, borderBottomWidth: 0.75, borderBottomColor: c.line },
    tableRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 0.75, borderBottomColor: c.line },
    th: { fontFamily: "Geist Mono", fontSize: 6.5, color: c.faint, letterSpacing: 1.2 },
    colIndex: { width: 26 },
    colDesc: { flex: 1, paddingRight: 14 },
    colHours: { width: 50, textAlign: "right" },
    colRate: { width: 70, textAlign: "right" },
    colAmount: { width: 86, textAlign: "right" },
    index: { fontFamily: "Geist Mono", fontSize: 8, color: c.accentText },
    itemTitle: { fontSize: 9, fontWeight: 500, lineHeight: 1.35 },
    itemNote: { fontSize: 7, color: c.muted, marginTop: 4 },
    num: { fontFamily: "Geist Mono", fontSize: 8.5 },
    totals: { alignSelf: "flex-end", width: 206, marginTop: 10 },
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

    // Payment panel
    spacer: { flexGrow: 1, minHeight: 18 },
    payment: {
      backgroundColor: c.panel,
      borderWidth: 0.75,
      borderColor: c.line,
      borderRadius: 8,
      padding: 14,
      flexDirection: "row",
    },
    payBody: { flex: 1 },
    payHead: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    payDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: c.accent, marginRight: 7 },
    payTitle: { fontSize: 9, fontWeight: 600 },
    payProvider: { fontFamily: "Geist Mono", fontSize: 7, color: c.muted, marginLeft: 8, letterSpacing: 0.8 },
    payGrid: { flexDirection: "row", flexWrap: "wrap" },
    payField: { width: "50%", paddingRight: 12, marginBottom: 7 },
    payWide: { width: "100%", paddingRight: 12 },
    payLabel: { fontFamily: "Geist Mono", fontSize: 6, color: c.faint, letterSpacing: 1, marginBottom: 2.5 },
    payValue: { fontSize: 7.5, lineHeight: 1.4 },
    payMono: { fontFamily: "Geist Mono", fontSize: 7.5, letterSpacing: 0.3 },
    qrWrap: { marginLeft: 14, alignItems: "center", justifyContent: "center", width: 88 },
    qrFrame: { backgroundColor: "#ffffff", padding: 5, borderRadius: 5 },
    qr: { width: 60, height: 60 },
    qrText: { fontFamily: "Geist Mono", fontSize: 6, color: c.muted, marginTop: 7, textAlign: "center", lineHeight: 1.4 },

    // Paper band — keeps a dark-ink signature legible
    band: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: BAND,
      backgroundColor: c.band,
      color: c.bandText,
      paddingHorizontal: PAD,
      paddingTop: 10,
      paddingBottom: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    signature: { width: 210 },
    signatureImage: { height: 64, width: 200, objectFit: "contain", objectPosition: "left bottom", marginBottom: 4 },
    signatureRule: { borderBottomWidth: 0.75, borderBottomColor: c.bandText, marginBottom: 5 },
    signer: { fontSize: 8, fontWeight: 600 },
    signerTitle: { fontFamily: "Geist Mono", fontSize: 6.5, color: c.bandMuted, letterSpacing: 1, marginTop: 2.5 },
    thanks: { alignItems: "flex-end" },
    thanksTitle: { fontSize: 13, fontWeight: 600, letterSpacing: -0.3 },
  })
}

const themes = { dark: makeStyles(palettes.dark), light: makeStyles(palettes.light) }
type Styles = (typeof themes)[InvoiceTheme]

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
  return (letters[0] ?? "") + (letters.length > 1 ? letters[letters.length - 1] : "")
}

function PayField({
  s,
  label,
  value,
  mono,
  wide,
}: {
  s: Styles
  label: string
  value: string
  mono?: boolean
  wide?: boolean
}) {
  if (!value.trim()) return null
  return (
    <View style={wide ? s.payWide : s.payField} wrap={false}>
      <Text style={s.payLabel}>{label}</Text>
      <Text style={mono ? s.payMono : s.payValue}>{value}</Text>
    </View>
  )
}

export function InvoiceDocument({ data, assets }: { data: InvoiceData; assets: InvoiceAssets }) {
  const hours = toNumber(data.hours)
  const rate = toNumber(data.rate)
  const total = hours * rate
  const provider = data.bankProvider.trim()
  const s = themes[data.theme === "light" ? "light" : "dark"]

  return (
    <Document
      title={`Invoice ${data.invoiceNumber}`}
      author={data.fromName}
      subject={`Invoice ${data.invoiceNumber} for ${data.clientName}`}
    >
      <Page size="A4" style={s.page}>
        <View style={s.top}>
          <View style={s.brand}>
            {assets.logo ? (
              <View style={s.logoTile}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
                <Image src={assets.logo} style={s.logo} />
              </View>
            ) : (
              <View style={s.mark}>
                <Text style={s.markText}>{initials(data.fromName) || "—"}</Text>
              </View>
            )}
            <View>
              <Text style={s.name}>{data.fromName || "Your name"}</Text>
              {data.fromTagline ? <Text style={s.tagline}>{data.fromTagline}</Text> : null}
            </View>
          </View>
          <View style={s.docTag}>
            <Text style={s.docTagText}>INVOICE </Text>
            <Text style={s.docTagNumber}>#{data.invoiceNumber || "—"}</Text>
          </View>
        </View>

        <View style={s.hero}>
          <View>
            <Text style={s.kicker}>{"// AMOUNT DUE"}</Text>
            <View style={s.amountRow}>
              <Text style={s.amount}>{formatMoney(total)}</Text>
              <View style={s.cursor} />
              <Text style={s.currency}>{CURRENCY}</Text>
            </View>
          </View>
          <View style={s.dates}>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>ISSUED</Text>
              <Text style={s.dateValue}>{formatDate(data.issueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={s.rule} />

        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.label}>BILLED TO</Text>
            <Text style={s.partyName}>{data.clientName}</Text>
            {data.clientContact ? <Text style={s.partyContact}>Attn. {data.clientContact}</Text> : null}
            {data.clientLegalName ? <Text style={s.partyLine}>{data.clientLegalName}</Text> : null}
            {data.clientRegistration ? <Text style={s.partyMono}>REG. NO. {data.clientRegistration}</Text> : null}
            {data.clientAddress ? <Text style={s.partyLine}>{data.clientAddress}</Text> : null}
          </View>
          <View style={s.party}>
            <Text style={s.label}>FROM</Text>
            <Text style={s.partyName}>{data.fromName}</Text>
            {data.fromEmail ? <Text style={s.partyContact}>{data.fromEmail}</Text> : null}
            {data.fromAddress ? <Text style={s.partyLine}>{data.fromAddress}</Text> : null}
            {data.fromTin ? <Text style={s.partyMono}>TIN {data.fromTin} · NON-VAT</Text> : null}
            {data.fromPhone ? <Text style={s.partyMono}>{data.fromPhone}</Text> : null}
          </View>
        </View>

        <View style={s.rule} />

        <View style={s.tableHead}>
          <Text style={[s.th, s.colIndex]}>#</Text>
          <Text style={[s.th, s.colDesc]}>DESCRIPTION</Text>
          <Text style={[s.th, s.colHours]}>HOURS</Text>
          <Text style={[s.th, s.colRate]}>RATE</Text>
          <Text style={[s.th, s.colAmount]}>AMOUNT</Text>
        </View>
        <View style={s.tableRow} wrap={false}>
          <Text style={[s.index, s.colIndex]}>01</Text>
          <View style={s.colDesc}>
            <Text style={s.itemTitle}>{data.description || "—"}</Text>
            {data.period ? <Text style={s.itemNote}>{data.period}</Text> : null}
          </View>
          <Text style={[s.num, s.colHours]}>{hours.toLocaleString("en-GB")}</Text>
          <Text style={[s.num, s.colRate]}>{formatMoney(rate)}</Text>
          <Text style={[s.num, s.colAmount]}>{formatMoney(total)}</Text>
        </View>

        <View style={s.totals} wrap={false}>
          <View style={s.totalLine}>
            <Text style={s.totalLabel}>SUBTOTAL</Text>
            <Text style={s.totalValue}>{formatMoney(total)}</Text>
          </View>
          <View style={s.totalLine}>
            <Text style={s.totalLabel}>VAT</Text>
            <Text style={s.totalValue}>0.00</Text>
          </View>
          <View style={s.grandLine}>
            <Text style={s.grandLabel}>TOTAL {CURRENCY}</Text>
            <Text style={s.grandValue}>{formatMoney(total)}</Text>
          </View>
        </View>

        <View style={s.spacer} />

        <View style={s.payment} wrap={false}>
          <View style={s.payBody}>
            <View style={s.payHead}>
              <View style={s.payDot} />
              <Text style={s.payTitle}>Payment details</Text>
              {provider ? <Text style={s.payProvider}>VIA {provider.toUpperCase()} · {CURRENCY}</Text> : null}
            </View>
            <View style={s.payGrid}>
              <PayField s={s} label="ACCOUNT NAME" value={data.accountName} />
              <PayField s={s} label="BANK" value={data.bankName} />
              <PayField s={s} label="ACCOUNT NO." value={data.accountNumber} mono />
              <PayField s={s} label="SORT CODE" value={data.sortCode} mono />
              <PayField s={s} label="IBAN" value={data.iban} mono />
              <PayField s={s} label="SWIFT / BIC" value={data.swift} mono />
              <PayField s={s} label="BANK ADDRESS" value={data.bankAddress} wide />
            </View>
          </View>
          {assets.qr ? (
            <View style={s.qrWrap}>
              <View style={s.qrFrame}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
                <Image src={assets.qr} style={s.qr} />
              </View>
              <Text style={s.qrText}>SCAN TO PAY{provider ? `\nVIA ${provider.toUpperCase()}` : ""}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.band} fixed>
          <View style={s.signature}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
            {assets.signature ? <Image src={assets.signature} style={s.signatureImage} /> : null}
            <View style={s.signatureRule} />
            <Text style={s.signer}>{data.fromName}</Text>
            {data.signerTitle ? <Text style={s.signerTitle}>{data.signerTitle.toUpperCase()}</Text> : null}
          </View>
          <View style={s.thanks}>
            <Text style={s.thanksTitle}>Thank you.</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

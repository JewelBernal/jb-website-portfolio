export type InvoiceTheme = "dark" | "light"

export type InvoiceData = {
  theme: InvoiceTheme

  // Contractor (you)
  fromName: string
  fromTagline: string
  fromAddress: string
  fromTin: string
  fromPhone: string
  fromEmail: string

  // Payment
  bankProvider: string
  accountName: string
  accountNumber: string
  sortCode: string
  iban: string
  swift: string
  bankName: string
  bankAddress: string

  // Client
  clientName: string
  clientContact: string
  clientLegalName: string
  clientRegistration: string
  clientAddress: string

  // Invoice
  invoiceNumber: string
  issueDate: string // yyyy-mm-dd
  description: string
  period: string
  hours: string
  rate: string
  signerTitle: string
}

export type InvoiceAssets = {
  logo?: string
  qr?: string
  signature?: string
}

export const CURRENCY = "GBP"

// Everything personal starts blank; it's saved in this browser only.
export const defaultInvoice: InvoiceData = {
  theme: "dark",

  fromName: "",
  fromTagline: "",
  fromAddress: "",
  fromTin: "",
  fromPhone: "",
  fromEmail: "",

  bankProvider: "Wise",
  accountName: "",
  accountNumber: "",
  sortCode: "",
  iban: "",
  swift: "",
  bankName: "",
  bankAddress: "",

  clientName: "QONTAHUB",
  clientContact: "",
  clientLegalName: "CONTEXTUAL TECHNOLOGIES S.R.L.",
  clientRegistration: "46635591",
  clientAddress: "Str. Popa Soare, Nr. 69, Parter, Camera 4, Sector 2,\n023982 București, Romania",

  invoiceNumber: "",
  issueDate: "",
  description: "",
  period: "",
  hours: "",
  rate: "",
  signerTitle: "Freelancer",
}

export const requiredFields: Exclude<keyof InvoiceData, "theme">[] = [
  "fromName",
  "fromAddress",
  "fromEmail",
  "accountName",
  "iban",
  "swift",
  "clientName",
  "clientLegalName",
  "clientAddress",
  "invoiceNumber",
  "issueDate",
  "description",
  "hours",
  "rate",
]

export function missingFields(data: InvoiceData) {
  return requiredFields.filter((key) => !data[key].trim())
}

export function toNumber(value: string) {
  const n = Number.parseFloat(value.replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

export function formatMoney(value: number) {
  return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

export function formatDate(iso: string) {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

export function invoiceFileName(data: InvoiceData) {
  const number = data.invoiceNumber.trim() || "draft"
  return `invoice-${number.replace(/[^\w-]+/g, "-")}.pdf`
}

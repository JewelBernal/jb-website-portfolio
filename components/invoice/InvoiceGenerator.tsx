"use client"

import { Download, Moon, RotateCcw, Sun, Trash2, Upload } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import InvoicePreview, { downloadInvoice } from "./InvoicePreview"
import {
  CURRENCY,
  defaultInvoice,
  formatMoney,
  missingFields,
  requiredFields,
  toNumber,
  type InvoiceAssets,
  type InvoiceData,
  type InvoiceTheme,
} from "./types"

const STORAGE_KEY = "invoice-generator:v1"
const SIGNATURE_KEY = "invoice-generator:signature"

type TextField = Exclude<keyof InvoiceData, "theme">

type FieldConfig = {
  key: TextField
  label: string
  placeholder?: string
  multiline?: boolean
  type?: "text" | "email" | "tel" | "date" | "number"
  half?: boolean
  hint?: string
}

const sections: { title: string; description: string; fields: FieldConfig[] }[] = [
  {
    title: "Invoice",
    description: `One line of accumulated time, billed in ${CURRENCY}.`,
    fields: [
      { key: "invoiceNumber", label: "Invoice no.", placeholder: "00001", half: true },
      { key: "issueDate", label: "Issue date", type: "date", half: true },
      { key: "description", label: "Description", placeholder: "Full-time Website Development" },
      { key: "period", label: "Period / note", placeholder: "Sep 2026 — for QontaHub" },
      { key: "hours", label: "Hours", type: "number", placeholder: "160", half: true },
      { key: "rate", label: `Rate (${CURRENCY} / hr)`, type: "number", placeholder: "0.00", half: true },
      { key: "signerTitle", label: "Signature title", placeholder: "Freelancer" },
    ],
  },
  {
    title: "From",
    description: "Your details as the contractor.",
    fields: [
      { key: "fromName", label: "Full name", placeholder: "Jewel Bernal" },
      { key: "fromTagline", label: "Tagline", placeholder: "Freelance Developer · Manila, PH" },
      { key: "fromAddress", label: "Address", multiline: true },
      { key: "fromTin", label: "TIN (non-VAT)", placeholder: "000-000-000-00000", half: true },
      { key: "fromPhone", label: "Phone", type: "tel", placeholder: "+63 900 000 0000", half: true },
      { key: "fromEmail", label: "Email", type: "email" },
    ],
  },
  {
    title: "Payment",
    description: "Where QontaHub should send the money.",
    fields: [
      { key: "bankProvider", label: "Provider", placeholder: "Wise", half: true },
      { key: "accountName", label: "Account name", half: true },
      { key: "accountNumber", label: "Account no.", half: true },
      { key: "sortCode", label: "Sort code", half: true },
      { key: "iban", label: "IBAN" },
      { key: "swift", label: "SWIFT / BIC", half: true },
      { key: "bankName", label: "Bank", placeholder: "Wise Payments Limited", half: true },
      { key: "bankAddress", label: "Bank address", multiline: true },
    ],
  },
  {
    title: "Issued to",
    description: "Prefilled with QontaHub's company details.",
    fields: [
      { key: "clientName", label: "Company", half: true },
      { key: "clientContact", label: "Attention", placeholder: "Contact person", half: true },
      { key: "clientLegalName", label: "Legal name", half: true },
      { key: "clientRegistration", label: "Registration no.", half: true },
      { key: "clientAddress", label: "Address", multiline: true },
    ],
  },
]

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Storage can be full or blocked; the form still works for this session.
  }
}

function loadInvoice(): InvoiceData {
  const saved = readStorage(STORAGE_KEY)
  const base = { ...defaultInvoice, issueDate: today() }
  if (!saved) return base
  try {
    return { ...base, ...(JSON.parse(saved) as Partial<InvoiceData>) }
  } catch {
    return base
  }
}

// Logo and QR live in public/invoice/ — only used if the files exist.
function usePublicImage(path: string) {
  const [src, setSrc] = useState<string>()
  useEffect(() => {
    const url = new URL(path, window.location.origin).href
    fetch(url, { method: "HEAD" })
      .then((res) => {
        const type = res.headers.get("content-type") ?? ""
        if (res.ok && type.startsWith("image/")) setSrc(url)
      })
      .catch(() => {})
  }, [path])
  return src
}

export default function InvoiceGenerator() {
  const [data, setData] = useState<InvoiceData>(loadInvoice)
  const [signature, setSignature] = useState<string | undefined>(() => readStorage(SIGNATURE_KEY) ?? undefined)
  const [showErrors, setShowErrors] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string>()
  const signatureInput = useRef<HTMLInputElement>(null)

  const logo = usePublicImage("/invoice/logo.png")
  const qr = usePublicImage("/invoice/qr.png")
  const assets = useMemo<InvoiceAssets>(() => ({ logo, qr, signature }), [logo, qr, signature])

  useEffect(() => {
    writeStorage(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const missing = missingFields(data)
  const total = toNumber(data.hours) * toNumber(data.rate)

  function set(key: TextField, value: string) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function setTheme(theme: InvoiceTheme) {
    setData((prev) => ({ ...prev, theme }))
  }

  function onSignature(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setSignature(url)
      writeStorage(SIGNATURE_KEY, url)
    }
    reader.readAsDataURL(file)
  }

  function clearSignature() {
    setSignature(undefined)
    writeStorage(SIGNATURE_KEY, null)
    if (signatureInput.current) signatureInput.current.value = ""
  }

  function resetInvoice() {
    // Keep your personal and payment details; clear only this invoice's specifics.
    setData((prev) => ({
      ...prev,
      invoiceNumber: "",
      issueDate: today(),
      description: "",
      period: "",
      hours: "",
    }))
    setShowErrors(false)
  }

  async function onDownload() {
    if (missing.length) {
      setShowErrors(true)
      document.getElementById(`field-${missing[0]}`)?.focus()
      return
    }
    setDownloading(true)
    setDownloadError(undefined)
    try {
      await downloadInvoice(data, assets)
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Something went wrong generating the PDF.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoice generator</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you enter is saved in this browser only — nothing is uploaded.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Invoice theme" className="flex rounded-lg bg-muted p-0.5">
            {(
              [
                { value: "dark", label: "Dark", Icon: Moon },
                { value: "light", label: "Light", Icon: Sun },
              ] as const
            ).map(({ value, label, Icon }) => (
              <Button
                key={value}
                variant={data.theme === value ? "outline" : "ghost"}
                aria-pressed={data.theme === value}
                onClick={() => setTheme(value)}
                className={cn("h-8", data.theme !== value && "text-muted-foreground")}
              >
                <Icon data-icon="inline-start" />
                {label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="lg" onClick={resetInvoice}>
            <RotateCcw data-icon="inline-start" />
            New invoice
          </Button>
          <Button size="lg" onClick={onDownload} disabled={downloading}>
            <Download data-icon="inline-start" />
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </header>

      {showErrors && missing.length > 0 ? (
        <p role="alert" className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Fill in {missing.length} required {missing.length === 1 ? "field" : "fields"} before downloading.
        </p>
      ) : null}
      {downloadError ? (
        <p role="alert" className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {downloadError}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {section.fields.map((field) => {
                  const id = `field-${field.key}`
                  const required = requiredFields.includes(field.key)
                  const invalid = showErrors && missing.includes(field.key)
                  const common = {
                    id,
                    value: data[field.key],
                    placeholder: field.placeholder,
                    required,
                    "aria-invalid": invalid || undefined,
                  }
                  return (
                    <div key={field.key} className={cn("flex flex-col gap-2", field.half ? "col-span-2 sm:col-span-1" : "col-span-2")}>
                      <Label htmlFor={id}>
                        {field.label}
                        {required ? <span className="text-destructive">*</span> : null}
                      </Label>
                      {field.multiline ? (
                        <Textarea {...common} rows={3} onChange={(e) => set(field.key, e.target.value)} />
                      ) : (
                        <Input
                          {...common}
                          type={field.type ?? "text"}
                          inputMode={field.type === "number" ? "decimal" : undefined}
                          min={field.type === "number" ? 0 : undefined}
                          step={field.type === "number" ? "any" : undefined}
                          onChange={(e) => set(field.key, e.target.value)}
                        />
                      )}
                    </div>
                  )
                })}
                {section.title === "Invoice" ? (
                  <div className="col-span-2 flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-sm">
                    <span className="text-muted-foreground">Total amount due</span>
                    <span className="font-mono font-medium">
                      {formatMoney(total)} {CURRENCY}
                    </span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Logo and QR code are read from <code className="font-mono text-xs">public/invoice/logo.png</code> and{" "}
                <code className="font-mono text-xs">qr.png</code>. Your signature stays in this browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={cn("rounded-md px-2 py-1", logo ? "bg-muted" : "bg-muted text-muted-foreground")}>
                  Logo: {logo ? "found" : "not found — using initials"}
                </span>
                <span className={cn("rounded-md px-2 py-1", qr ? "bg-muted" : "bg-muted text-muted-foreground")}>
                  QR code: {qr ? "found" : "not found — hidden"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="signature">Signature (PNG with transparent background works best)</Label>
                <div className="flex items-center gap-3">
                  {signature ? (
                    // eslint-disable-next-line @next/next/no-img-element -- data URL preview
                    <img src={signature} alt="Your signature" className="h-12 max-w-40 rounded-md bg-white object-contain p-1 ring-1 ring-foreground/10" />
                  ) : null}
                  <input
                    ref={signatureInput}
                    id="signature"
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={(e) => onSignature(e.target.files?.[0])}
                  />
                  <Button variant="outline" onClick={() => signatureInput.current?.click()}>
                    <Upload data-icon="inline-start" />
                    {signature ? "Replace" : "Upload"}
                  </Button>
                  {signature ? (
                    <Button variant="ghost" onClick={clearSignature}>
                      <Trash2 data-icon="inline-start" />
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <InvoicePreview data={data} assets={assets} />
        </div>
      </div>
    </div>
  )
}

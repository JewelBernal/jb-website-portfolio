"use client"

import { pdf, usePDF } from "@react-pdf/renderer"
import { useEffect } from "react"

import { InvoiceDocument } from "./InvoiceDocument"
import { invoiceFileName, type InvoiceAssets, type InvoiceData } from "./types"

export async function downloadInvoice(data: InvoiceData, assets: InvoiceAssets) {
  const blob = await pdf(<InvoiceDocument data={data} assets={assets} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = invoiceFileName(data)
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function InvoicePreview({ data, assets }: { data: InvoiceData; assets: InvoiceAssets }) {
  const [instance, update] = usePDF()

  // Re-render the PDF shortly after typing stops rather than on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => update(<InvoiceDocument data={data} assets={assets} />), 350)
    return () => clearTimeout(timer)
  }, [data, assets, update])

  if (instance.error) {
    return (
      <div className="flex aspect-[1/1.414] items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm text-destructive">
        Couldn&apos;t render the preview: {instance.error}
      </div>
    )
  }

  return (
    <div className="relative aspect-[1/1.414] overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
      {instance.url ? (
        <iframe
          key={instance.url}
          src={`${instance.url}#toolbar=0&navpanes=0&view=Fit`}
          title="Invoice preview"
          className="size-full"
        />
      ) : null}
      {instance.loading ? (
        <div className="absolute top-3 right-3 rounded-md bg-background/80 px-2 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
          Rendering…
        </div>
      ) : null}
    </div>
  )
}

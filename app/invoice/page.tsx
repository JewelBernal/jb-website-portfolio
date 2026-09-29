import type { Metadata } from "next"

import InvoiceApp from "@/components/invoice/InvoiceApp"

export const metadata: Metadata = {
  title: "Invoice Generator",
  robots: { index: false, follow: false },
}

export default function InvoicePage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <InvoiceApp />
    </main>
  )
}

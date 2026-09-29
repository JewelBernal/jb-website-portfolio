"use client"

import dynamic from "next/dynamic"

// react-pdf and localStorage are browser-only, so skip prerendering the generator.
const InvoiceGenerator = dynamic(() => import("./InvoiceGenerator"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center p-8 font-mono text-sm text-muted-foreground">
      Loading invoice generator…
    </div>
  ),
})

export default function InvoiceApp() {
  return <InvoiceGenerator />
}

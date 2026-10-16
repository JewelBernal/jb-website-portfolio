import type { InvoiceTheme } from "@/components/invoice/types"

import type { SheetModel } from "./TimesheetDocument"

// Share links carry the whole month inside the URL fragment (#d=…). Browsers never send
// the fragment to a server, so the timesheet isn't stored or logged anywhere.
export const SHARE_PATH = "/share/timesheet/"

type Payload = { v: 1; theme: InvoiceTheme; sheet: SheetModel }

function toBase64Url(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(text: string) {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function transform(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const body = new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(body).arrayBuffer())
}

// Compressed when the browser supports it ("z" prefix), plain JSON otherwise ("j")
export async function encodeShare(sheet: SheetModel, theme: InvoiceTheme) {
  const json = new TextEncoder().encode(JSON.stringify({ v: 1, theme, sheet } satisfies Payload))
  if (typeof CompressionStream === "undefined") return `j${toBase64Url(json)}`
  return `z${toBase64Url(await transform(json, new CompressionStream("deflate-raw")))}`
}

export async function shareUrl(sheet: SheetModel, theme: InvoiceTheme) {
  return `${window.location.origin}${SHARE_PATH}#d=${await encodeShare(sheet, theme)}`
}

function isSheet(value: unknown): value is SheetModel {
  const sheet = value as SheetModel
  return (
    typeof sheet === "object" &&
    sheet !== null &&
    typeof sheet.month === "string" &&
    typeof sheet.total === "number" &&
    typeof sheet.rate === "number" &&
    Array.isArray(sheet.days)
  )
}

export async function decodeShare(hash: string): Promise<Payload | null> {
  const data = new URLSearchParams(hash.replace(/^#/, "")).get("d")
  if (!data) return null
  try {
    const raw = fromBase64Url(data.slice(1))
    const bytes = data[0] === "z" ? await transform(raw, new DecompressionStream("deflate-raw")) : raw
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as Payload
    if (payload.v !== 1 || !isSheet(payload.sheet)) return null
    return { ...payload, theme: payload.theme === "dark" ? "dark" : "light" }
  } catch {
    return null
  }
}

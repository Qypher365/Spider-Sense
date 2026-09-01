import type { ScanFailure, ScanRequest, ScanResponse } from "@/src/types/scan"

const unavailable = "We couldn’t complete this scan right now. Please try again in a moment."

export class ScanApiError extends Error {
  constructor(message = unavailable) { super(message); this.name = "ScanApiError" }
}

export async function submitScan(payload: ScanRequest): Promise<ScanResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!baseUrl) throw new ScanApiError()

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as ScanFailure | null
    throw new ScanApiError(failure?.error || unavailable)
  }
  return response.json() as Promise<ScanResponse>
}

"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { submitScan } from "@/src/lib/api"
import { mergeScanFields, type ScanHistoryItem, type ScanReport, type ScanRequest, type ScanStatus } from "@/src/types/scan"

type ScanContextValue = {
  report: ScanReport | null
  history: ScanHistoryItem[]
  status: ScanStatus
  error: string | null
  runScan: (request: ScanRequest) => Promise<boolean>
  deleteHistoryItem: (scanId: string) => void
  resetError: () => void
}

const ScanContext = createContext<ScanContextValue | null>(null)

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [report, setReport] = useState<ScanReport | null>(null)
  const [history, setHistory] = useState<ScanHistoryItem[]>([])
  const [status, setStatus] = useState<ScanStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  async function runScan(request: ScanRequest) {
    setStatus("scanning"); setError(null)
    try {
      const response = await submitScan(request)
      const next = { ...request, ...response, fields_merged: mergeScanFields(request, response) }
      setReport(next)
      setHistory((items) => [
        { 
          scan_id: response.scan_id, 
          url: request.url, 
          page_title: request.page_title, 
          scan_timestamp: request.scan_timestamp, 
          overall_score: response.overall_score, 
          risk_level: response.risk_level, 
          total_fields: request.fields.length, 
          critical_fields: response.field_results.filter((field) => field.sensitivity.toLowerCase() === "critical").length 
        }, 
        ...items
      ])
      setStatus("success")
      return true
    } catch (cause) {
      setStatus("error")
      setError(cause instanceof Error ? cause.message : "We couldn’t complete this scan right now. Please try again in a moment.")
      return false
    }
  }

  function deleteHistoryItem(scanId: string) {
    setHistory((items) => items.filter((item) => item.scan_id !== scanId))
  }

  const value = useMemo(
    () => ({ 
      report, 
      history, 
      status, 
      error, 
      runScan, 
      deleteHistoryItem, 
      resetError: () => { setError(null); setStatus("idle") } 
    }), 
    [report, history, status, error]
  )

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>
}

export function useScan() {
  const context = useContext(ScanContext)
  if (!context) throw new Error("useScan must be used within ScanProvider")
  return context
}
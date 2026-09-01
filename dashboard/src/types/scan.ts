export type LabelSource = "label_for" | "aria_label" | "placeholder" | "nearby_text" | "none"
export type LabelConfidence = "high" | "medium" | "low" | "unknown"
export type RiskLevel = "low" | "medium" | "high" | "critical" | string

export interface ExtractedField {
  field_id: string
  name: string
  label: string
  label_source: LabelSource
  type: string
  placeholder: string
  autocomplete: string
  required: boolean
}

export interface ScanRequest {
  url: string
  page_title: string
  scan_timestamp: string
  fields: ExtractedField[]
}

export interface FieldResult {
  field_id: string
  sensitivity: string
  reasonable: boolean
  label_confidence: LabelConfidence
  notes: string
}

export interface ScanResponse {
  scan_id: string
  overall_score: number
  risk_level: string
  field_results: FieldResult[]
}

export interface ScanFailure { error: string }

export interface DetectedField extends ExtractedField, FieldResult {}

export interface ScanReport extends ScanRequest, ScanResponse {
  fields_merged: DetectedField[]
  explanation?: string
  recommendations?: string[]
}

export interface ScanHistoryItem {
  scan_id: string
  url: string
  page_title: string
  scan_timestamp: string
  overall_score: number
  risk_level: string
  total_fields: number
  critical_fields: number
}

export type ScanStatus = "idle" | "scanning" | "success" | "error"

export function mergeScanFields(request: ScanRequest, response: ScanResponse): DetectedField[] {
  const source = new Map(request.fields.map((field) => [field.field_id, field]))
  return response.field_results.flatMap((result) => {
    const field = source.get(result.field_id)
    return field ? [{ ...field, ...result }] : []
  })
}

export function normalizedRisk(level: string): "low" | "medium" | "high" | "critical" {
  const value = level.toLowerCase()
  if (value === "low" || value === "medium" || value === "high" || value === "critical") return value
  return "medium"
}

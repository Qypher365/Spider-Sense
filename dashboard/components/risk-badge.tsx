import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { normalizedRisk } from "@/src/types/scan"

export function RiskBadge({ level }: { level: string }) {
  const risk = normalizedRisk(level)
  const Icon = risk === "low" ? CheckCircle2 : risk === "medium" ? CircleAlert : AlertTriangle
  return <Badge className={`risk-${risk}`}><Icon data-icon="inline-start" />{risk[0].toUpperCase() + risk.slice(1)} risk</Badge>
}

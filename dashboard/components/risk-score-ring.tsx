"use client"

import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts"
import { normalizedRisk } from "@/src/types/scan"

const colors = { low: "#22C55E", medium: "#F59E0B", high: "#E11D48", critical: "#EF4444" }
export function RiskScoreRing({ score, level }: { score: number; level: string }) {
  const risk = normalizedRisk(level)
  const label = risk[0].toUpperCase() + risk.slice(1)
  return <div className="relative mx-auto h-64 max-w-72" role="img" aria-label={`Risk score ${score} out of 100, ${label} risk`}><ResponsiveContainer width="100%" height="100%"><RadialBarChart innerRadius="78%" outerRadius="100%" data={[{ value: score, fill: colors[risk] }]} startAngle={90} endAngle={-270}><RadialBar dataKey="value" background={{ fill: "#1B2231" }} cornerRadius={12} /></RadialBarChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center"><strong className="text-5xl">{score}</strong><span className="text-sm text-muted-foreground">out of 100</span><span className="mt-2 font-medium">{label} risk</span></div></div>
}

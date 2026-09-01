"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight, Eye, FileSearch, RotateCcw, ShieldCheck, Sparkles } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useScan } from "@/components/scan-provider"
import { RiskBadge } from "@/components/risk-badge"
import { RiskScoreRing } from "@/components/risk-score-ring"
import { DetectedFieldCard } from "@/components/detected-field-card"

export function Dashboard() {
  const { report, status, error, resetError } = useScan()
  if (status === "scanning") return <ScanLoading />
  if (status === "error") return <ErrorState message={error} onRetry={resetError} />
  if (!report) return <EmptyDashboard />
  const critical = report.field_results.filter((field) => field.sensitivity.toLowerCase() === "critical").length
  return <div className="mx-auto flex max-w-7xl flex-col gap-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><RiskBadge level={report.risk_level} /><h2 className="mt-3 text-balance text-3xl font-semibold">{new URL(report.url).hostname}</h2><p className="mt-1 text-muted-foreground">{report.page_title} · {new Date(report.scan_timestamp).toLocaleString()}</p></div><Button nativeButton={false} render={<Link href="/scan" />}><FileSearch data-icon="inline-start" />Scan Website</Button></div>
    <div className="grid gap-4 md:grid-cols-3"><Metric label="Risk Score" value={`${report.overall_score}/100`} detail={report.risk_level} /><Metric label="Total Fields Scanned" value={String(report.fields.length)} detail="Detected inputs" /><Metric label="Critical Fields" value={String(critical)} detail="Requires attention" /></div>
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]"><Card><CardHeader><CardTitle>Overall assessment</CardTitle><CardDescription>Contextual privacy risk</CardDescription></CardHeader><CardContent><RiskScoreRing score={report.overall_score} level={report.risk_level} /></CardContent></Card><Card><CardHeader><CardTitle>Detected data</CardTitle><CardDescription>Each request is evaluated in the context of this page.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{report.fields_merged.map((field) => <DetectedFieldCard key={field.field_id} field={field} />)}</CardContent></Card></div>
    <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-accent-blue" />AI explanation</CardTitle></CardHeader><CardContent><p className="leading-relaxed text-muted-foreground">{report.explanation || "An explanation will appear when it is provided by the analysis service."}</p></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-safe" />Recommendations</CardTitle></CardHeader><CardContent>{report.recommendations?.length ? <ul className="flex flex-col gap-2">{report.recommendations.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="text-muted-foreground">Practical next steps will appear when they are provided by the analysis service.</p>}</CardContent></Card></div>
  </div>
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <Card><CardHeader className="pb-2"><CardDescription>{label}</CardDescription><CardTitle className="text-3xl">{value}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{detail}</p></CardContent></Card> }

export function EmptyDashboard() { return <section className="relative mx-auto flex min-h-[calc(100vh-12rem)] max-w-6xl items-center overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 md:px-14"><div className="brand-panels" aria-hidden="true"><BrandLogo className="size-full rounded-2xl opacity-30" priority /></div><div className="relative max-w-2xl"><div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground"><Eye className="size-4 text-accent-blue" />Context-aware privacy scanning</div><h2 className="font-serif text-balance text-5xl leading-tight md:text-7xl">Know what you&apos;re <span className="brand-gradient">sharing.</span></h2><p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">Spider Sense identifies sensitive form requests, evaluates why they&apos;re being asked for, and helps you make a more informed choice.</p><div className="mt-8 flex flex-wrap items-center gap-4"><Button size="lg" render={<Link href="/scan" />}>Start your first scan<ArrowRight data-icon="inline-end" /></Button><span className="text-sm text-muted-foreground">No scans yet · Your report will appear here</span></div></div></section> }

function ScanLoading() { return <section className="flex min-h-[60vh] flex-col items-center justify-center text-center"><div className="scan-logo"><BrandLogo className="size-28" priority /></div><h2 className="mt-8 text-2xl font-semibold">Reading the page context</h2><p className="mt-2 text-muted-foreground">Detecting, classifying, and assessing requested fields.</p></section> }
function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) { return <section className="flex min-h-[60vh] flex-col items-center justify-center text-center"><div className="rounded-full bg-destructive/10 p-4"><AlertCircle className="size-7 text-destructive" /></div><h2 className="mt-5 text-2xl font-semibold">Scan unavailable</h2><p className="mt-2 max-w-md text-muted-foreground">{message || "We couldn’t complete this scan right now. Please try again in a moment."}</p><Button className="mt-6" variant="outline" onClick={onRetry}><RotateCcw data-icon="inline-start" />Retry</Button></section> }

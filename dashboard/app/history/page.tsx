"use client"

import { useMemo, useState } from "react"
import { Clock3, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useScan } from "@/components/scan-provider"
import { RiskBadge } from "@/components/risk-badge"

export default function HistoryPage() {
  const { history } = useScan(); const [query, setQuery] = useState(""); const [risk, setRisk] = useState("all")
  const filtered = useMemo(() => history.filter((item) => (item.url + item.page_title).toLowerCase().includes(query.toLowerCase()) && (risk === "all" || item.risk_level.toLowerCase() === risk)), [history, query, risk])
  return <div className="mx-auto flex max-w-6xl flex-col gap-6"><div><h2 className="text-3xl font-semibold">Scan history</h2><p className="mt-2 text-muted-foreground">Review completed contextual privacy assessments.</p></div><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by domain or page" className="pl-9" /></div><Select value={risk} onValueChange={(value) => setRisk(value ?? "all")}><SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Risk level" /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">All risk levels</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectGroup></SelectContent></Select></div>{filtered.length ? <div className="flex flex-col gap-3">{filtered.map((item) => <Card key={item.scan_id}><CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"><div><p className="font-semibold">{new URL(item.url).hostname}</p><p className="text-sm text-muted-foreground">{item.page_title} · {new Date(item.scan_timestamp).toLocaleString()}</p></div><div className="flex flex-wrap items-center gap-4"><RiskBadge level={item.risk_level} /><p className="text-sm"><strong>{item.overall_score}/100</strong> score</p><p className="text-sm text-muted-foreground">{item.total_fields} fields · {item.critical_fields} critical</p></div></CardContent></Card>)}</div> : <Card><CardContent className="flex min-h-96 flex-col items-center justify-center text-center"><div className="rounded-full bg-muted p-4"><Clock3 className="size-7 text-muted-foreground" /></div><h3 className="mt-5 text-xl font-semibold">No scan history yet</h3><p className="mt-2 max-w-sm text-muted-foreground">Completed scans will appear here chronologically, ready to search and filter.</p></CardContent></Card>}</div>
}

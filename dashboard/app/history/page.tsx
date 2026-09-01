"use client"

import { useState } from "react"
import { Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useScan } from "@/components/scan-provider"

export default function HistoryPage() {
  const { history, deleteHistoryItem } = useScan()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredHistory = history.filter(
    (item) =>
      item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.page_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">WORKSPACE</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Scan history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review completed contextual privacy assessments.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by domain or page"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10"
          />
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/50 p-12 text-center text-sm text-muted-foreground">
          No scan history found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.scan_id}
              className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-border sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">{item.page_title || item.url}</h3>
                <p className="text-xs text-muted-foreground">
                  {item.url} · {new Date(item.scan_timestamp).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400">
                  {item.risk_level}
                </span>

                <span className="text-sm font-semibold text-foreground">
                  {item.overall_score}/100 <span className="font-normal text-muted-foreground">score</span>
                </span>

                <span className="text-xs text-muted-foreground">
                  {item.total_fields} fields · {item.critical_fields} critical
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteHistoryItem(item.scan_id)}
                  className="size-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Delete record"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
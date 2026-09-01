"use client"

import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { DetectedField } from "@/src/types/scan"

export function DetectedFieldCard({ field }: { field: DetectedField }) {
  return <Collapsible className="group rounded-xl border border-border bg-background/50 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-blue/30">
    <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-4 text-left"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{field.label || field.name || "Unlabelled field"}</p><Badge variant="secondary">{field.required ? "Required" : "Optional"}</Badge><Badge variant={field.reasonable ? "outline" : "destructive"}>{field.reasonable ? "Expected for this page" : "Needs review"}</Badge></div><p className="mt-2 truncate text-sm text-muted-foreground">{field.type} · {field.sensitivity} sensitivity · {field.notes}</p></div><ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" /></CollapsibleTrigger>
    <CollapsibleContent className="border-t border-border px-4 py-4"><dl className="grid gap-4 text-sm md:grid-cols-2"><Detail term="Field details" value={`${field.type} input · ${field.label_source.replaceAll("_", " ")}`} /><Detail term="Label confidence" value={field.label_confidence} /><Detail term="Contextual reasoning" value={field.notes} /><Detail term="Recommended action" value={field.reasonable ? "Proceed if this information is needed to complete your task." : "Verify why this page needs this information before continuing."} /></dl></CollapsibleContent>
  </Collapsible>
}
function Detail({ term, value }: { term: string; value: string }) { return <div><dt className="font-medium text-foreground">{term}</dt><dd className="mt-1 leading-relaxed text-muted-foreground">{value}</dd></div> }

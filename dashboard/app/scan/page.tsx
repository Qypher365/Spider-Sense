"use client"

import { FormEvent, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, BrainCircuit, FileSearch, ScanText, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useScan } from "@/components/scan-provider"

const stages = [{ label: "Detect", icon: ScanText }, { label: "Classify", icon: FileSearch }, { label: "Assess", icon: ShieldCheck }, { label: "Explain", icon: BrainCircuit }]

export default function ScanPage() {
  const [url, setUrl] = useState("")
  const [invalid, setInvalid] = useState(false)
  const { runScan, status, error } = useScan()
  const router = useRouter()
  const scanning = status === "scanning"
  const hasAutoScanned = useRef(false)

  // Auto-trigger scan when opened from extension
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const passedUrl = params.get("url")
    const passedFields = params.get("fields")
    
    if (passedUrl) {
      setUrl(passedUrl)
      
      // Prevent duplicate triggers
      if (hasAutoScanned.current) return
      hasAutoScanned.current = true

      let parsedFields = []
      if (passedFields) {
        try {
          parsedFields = JSON.parse(passedFields)
        } catch (err) {
          console.error("Failed to parse fields from extension", err)
        }
      }

      executeScan(passedUrl, parsedFields)
    }
  }, [])

  async function executeScan(targetUrl: string, fieldsToScan: any[]) {
    let parsed: URL
    try { 
      parsed = new URL(targetUrl)
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error() 
    } catch { 
      setInvalid(true)
      return 
    }
    
    setInvalid(false)
    
    const success = await runScan({ 
      url: parsed.toString(), 
      page_title: parsed.hostname, 
      scan_timestamp: new Date().toISOString(),
      fields: fieldsToScan
    })
    
    if (success) router.push("/") 
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    executeScan(url, [])
  }
  
  return (
    <div className="mx-auto grid max-w-6xl gap-8 xl:grid-cols-[1fr_360px]">
      <section>
        <p className="text-sm font-medium text-primary">New privacy scan</p>
        <h2 className="mt-3 text-balance text-4xl font-semibold md:text-5xl">Understand what a page is asking from you.</h2>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">Spider Sense checks sensitive form-field requests and evaluates whether they make sense in the context of the page.</p>
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Scan a website</CardTitle>
            <CardDescription>Enter a public page URL. Field extraction will be supplied by the extension integration.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label htmlFor="website" className="text-sm font-medium">Website URL</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input id="website" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/form" aria-invalid={invalid} disabled={scanning} className="h-12" />
                <Button type="submit" size="lg" disabled={scanning}>
                  {scanning ? "Scanning…" : "Scan Website"}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
              {invalid && <p className="text-sm text-destructive">Enter a valid URL beginning with http:// or https://.</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {scanning && <Progress value={40} aria-label="Scan in progress" />}
            </form>
          </CardContent>
        </Card>
      </section>
      <aside>
        <Card>
          <CardHeader>
            <CardTitle>How analysis works</CardTitle>
            <CardDescription>Four clear stages, one contextual assessment.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stages.map(({ label, icon: Icon }, index) => (
              <div key={label} className="flex items-center gap-4 rounded-lg p-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">Step {index + 1} of 4</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
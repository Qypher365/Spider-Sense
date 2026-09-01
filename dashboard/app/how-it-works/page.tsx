import type { Metadata } from "next"
import { CircleAlert, Eye, GaugeCircle, ListChecks, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "How to understand your results",
  description: "Read your Spider Sense Privacy Score and decide before you share.",
}

const bands = [
  { range: "80–100", label: "Low risk", detail: "The request appears appropriate", color: "#22C55E" },
  { range: "50–79", label: "Needs review", detail: "Check why the information is required", color: "#F59E0B" },
  { range: "20–49", label: "High risk", detail: "Share only if the website and purpose are trusted", color: "#F97316" },
  { range: "0–19", label: "Critical risk", detail: "Avoid sharing until the request is verified", color: "#EF4444" },
]

const sections = [
  {
    title: "Check the score",
    icon: GaugeCircle,
    body: "A lower Privacy Score means higher potential privacy risk. Use the number as a quick signal for how much attention a request deserves before you continue.",
  },
  {
    title: "Review flagged fields",
    icon: ListChecks,
    body: "Open any detected field to see why it was highlighted. Each field explains what information is being requested and how confident the detection is.",
  },
  {
    title: "Understand the context",
    icon: Eye,
    body: "The same information can be reasonable on one page and unnecessary on another. Spider Sense weighs each request against what the page is actually asking you to do.",
  },
  {
    title: "Decide before sharing",
    icon: ShieldCheck,
    body: "Spider Sense helps you pause and make an informed decision. It does not make legal claims and does not automatically block forms — the choice stays with you.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 pb-12">
      <section className="max-w-3xl pt-2">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-blue">Reading your results</p>
        <h2 className="font-serif text-4xl tracking-tight text-balance md:text-5xl">How to understand your results</h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          Spider Sense gives every scanned page a Privacy Score. A higher score means the data request appears safer and more
          appropriate for the page. A lower score means more privacy risk and a stronger need for review.
        </p>
      </section>

      <section aria-labelledby="scale-title">
        <Card className="border border-border bg-card">
          <CardHeader>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-blue">Privacy Score scale</p>
            <CardTitle id="scale-title" className="mt-2 text-2xl">What your score means</CardTitle>
            <CardDescription className="max-w-2xl leading-relaxed">
              Read the score alongside its status label — colour alone never carries the meaning.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <div
                className="h-3 w-full rounded-full"
                style={{ background: "linear-gradient(90deg, #22C55E 0%, #F59E0B 50%, #EF4444 100%)" }}
                aria-hidden="true"
              />
              <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
                <span>100 · Safest</span>
                <span>50 · Needs review</span>
                <span>0 · Highest risk</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {bands.map(({ range, label, detail, color }) => (
                <div key={range} className="lift-card flex flex-col gap-2 rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                    <span className="font-mono text-sm font-semibold" style={{ color }}>{range}</span>
                  </div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm italic leading-relaxed text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="steps-title">
        <div className="mb-5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-blue">Make an informed choice</p>
          <h3 id="steps-title" className="mt-2 text-2xl font-semibold tracking-tight">From score to decision</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map(({ title, body, icon: Icon }) => (
            <Card key={title} className="lift-card border border-border bg-card">
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-accent-blue/30 bg-accent-blue/10 text-accent-blue">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="leading-relaxed">{body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="note-title">
        <div className="flex items-start gap-3 rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-4">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-accent-blue" aria-hidden="true" />
          <p id="note-title" className="text-sm italic leading-relaxed text-muted-foreground">
            Spider Sense evaluates the context of requested form data to help you decide. It highlights risk and reasoning —
            it does not make legal claims or submit forms on your behalf.
          </p>
        </div>
      </section>
    </div>
  )
}

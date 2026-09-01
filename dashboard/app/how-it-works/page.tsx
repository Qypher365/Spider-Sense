import type { Metadata } from "next"
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  Eye,
  FileSearch,
  Fingerprint,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "How it works",
  description: "Understand how Spider Sense assesses form privacy risk.",
}

const steps = [
  { title: "Detect", description: "Identify form fields and the data a page wants you to provide.", icon: FileSearch },
  { title: "Classify", description: "Recognise the type of information being requested.", icon: Fingerprint },
  { title: "Assess context", description: "Check whether the request makes sense for that specific website.", icon: BrainCircuit },
  { title: "Explain", description: "Show the risk, reasoning, and recommended next action.", icon: Eye },
]

const levels = [
  { label: "Low risk", guidance: "Review normally", icon: ShieldCheck, className: "text-risk-low" },
  { label: "Medium risk", guidance: "Check why the information is required", icon: CircleAlert, className: "text-risk-medium" },
  { label: "High risk", guidance: "Share only if the website and purpose are trusted", icon: ShieldAlert, className: "text-risk-high" },
  { label: "Critical risk", guidance: "Avoid sharing until the request is verified", icon: CircleAlert, className: "text-risk-critical" },
]

const actions = [
  "Review the detected fields",
  "Expand a field to understand why it was flagged",
  "Check whether the request is reasonable for the page",
  "Avoid submitting unnecessary sensitive information",
]

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 pb-12">
      <section className="max-w-3xl pt-2">
        <div className="mb-5 flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          <BadgeCheck className="size-5" aria-hidden="true" />
        </div>
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-blue">Privacy risk, explained</p>
        <h2 className="font-serif text-4xl tracking-tight text-balance md:text-5xl">Understand your privacy risk</h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          Spider Sense helps you understand what a form requests, why it may need that information, and how much privacy risk is involved.
        </p>
      </section>

      <section aria-labelledby="process-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-blue">Four clear checks</p>
            <h3 id="process-title" className="mt-2 text-2xl font-semibold tracking-tight">From form to guidance</h3>
          </div>
          <p className="hidden max-w-sm text-right text-sm leading-relaxed text-muted-foreground md:block">Each step adds context before Spider Sense presents the final risk level.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <Card key={title} className="group min-h-52 border border-border bg-card transition-all duration-400 hover:-translate-y-1 hover:border-accent-blue/50">
              <CardHeader>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-accent-blue/30 bg-accent-blue/10 text-accent-blue">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">STEP {index + 1}</span>
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="leading-relaxed">{description}</CardDescription>
              </CardHeader>
              {index < steps.length - 1 && <ArrowRight className="absolute hidden text-accent-blue/40 xl:block" aria-hidden="true" />}
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]" aria-labelledby="score-title">
        <Card className="border border-border bg-card">
          <CardHeader>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-blue">Risk guidance</p>
            <CardTitle id="score-title" className="mt-2 text-2xl">How to read your score</CardTitle>
            <CardDescription className="max-w-2xl leading-relaxed">Higher Risk Score means more sensitive or potentially unnecessary data is being requested.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {levels.map(({ label, guidance, icon: Icon, className }) => (
                <div key={label} className="flex min-h-24 items-start gap-3 rounded-xl border border-border bg-background/50 p-4 transition-colors duration-400 hover:border-foreground/20">
                  <Icon className={`mt-0.5 size-5 shrink-0 ${className}`} aria-hidden="true" />
                  <div><p className="font-semibold">{label}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{guidance}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-4">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-accent-blue" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-muted-foreground">Spider Sense does not use fixed numeric thresholds in this interface. The backend risk level determines the final classification.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Stay in control</p>
            <CardTitle className="mt-2 text-2xl">What you can do next</CardTitle>
            <CardDescription className="leading-relaxed">Use the explanation to make a more informed choice before you submit.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {actions.map((action) => (
                <li key={action} className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, CircleHelp, Clock3, LayoutDashboard, Radar, ScanSearch } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ScanProvider } from "@/components/scan-provider"

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Scan", icon: ScanSearch },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/how-it-works", label: "How it works", icon: CircleHelp },
]

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === "/extension-preview") return <main className="min-h-screen bg-background">{children}</main>
  const current = items.find((item) => item.href === pathname)?.label ?? "Dashboard"
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-sidebar lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3 border-b border-border px-6 py-6">
          <BrandLogo className="size-10" priority />
          <div><p className="font-sans font-semibold tracking-tight">Spider Sense</p><p className="text-xs text-muted-foreground">Privacy intelligence</p></div>
        </Link>
        <nav aria-label="Primary navigation" className="flex flex-col gap-2 p-4">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:bg-accent hover:text-foreground", label === "Scan" && "font-semibold", active && "bg-primary/10 text-primary")}><Icon className="size-5" />{label}</Link>
          })}
        </nav>
        <div className="mt-auto p-5"><div className="rounded-xl border border-border bg-card p-4"><Radar className="mb-3 size-5 text-accent-blue" /><p className="text-sm font-medium">Context matters</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Sensitive data is assessed against what each page is asking you to do.</p></div></div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl md:px-8">
          <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Workspace</p><h1 className="text-xl font-semibold">{current}</h1></div>
          <div className="flex items-center gap-2">
            <Popover><PopoverTrigger render={<Button variant="ghost" size="icon" aria-label="View notifications"><Bell /></Button>} /><PopoverContent align="end" className="w-80"><div className="flex flex-col gap-4"><div><p className="font-semibold">Notifications</p><p className="text-sm text-muted-foreground">Scan updates will appear here.</p></div><div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">No new notifications</div></div></PopoverContent></Popover>
            <Button nativeButton={false} render={<Link href="/scan" />} className="hidden sm:inline-flex"><ScanSearch data-icon="inline-start" />Scan Website</Button>
          </div>
        </header>
        <nav aria-label="Mobile navigation" className="flex border-b border-border px-4 lg:hidden">{items.map(({ href, label }) => <Link key={href} href={href} className={cn("flex-1 border-b-2 border-transparent py-3 text-center text-sm text-muted-foreground", pathname === href && "border-primary text-foreground")}>{label}</Link>)}</nav>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) { return <ScanProvider><Shell>{children}</Shell></ScanProvider> }
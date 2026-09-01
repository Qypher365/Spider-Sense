import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Radley } from "next/font/google"
import { AppShell } from "@/components/app-shell"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const radley = Radley({ subsets: ["latin"], weight: "400", variable: "--font-radley" })

export const metadata: Metadata = {
  title: { default: "Spider Sense — Privacy intelligence", template: "%s · Spider Sense" },
  description: "Context-aware sensitive data detection for the forms you encounter online.",
  generator: "v0.app",
}

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#090A0F", width: "device-width", initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background dark"><body className={`${inter.variable} ${radley.variable} font-sans antialiased`}><TooltipProvider><AppShell>{children}</AppShell></TooltipProvider>{process.env.NODE_ENV === "production" && <Analytics />}</body></html>
}

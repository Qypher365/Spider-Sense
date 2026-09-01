import Image from "next/image"
import { cn } from "@/lib/utils"

export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/spider-sense-logo.jpg" alt="Spider Sense" width={96} height={96} priority={priority} className={cn("rounded-lg object-cover", className)} />
}

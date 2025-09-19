"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plug } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Integrations",
    href: "/integrations",
    icon: Plug,
  },
]

export function SideMenu() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground">
      <div className="h-14 flex items-center px-4 border-b">
        <span className="text-sm font-semibold tracking-wide">Starsling</span>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  {Icon ? <Icon className="size-4" /> : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3 text-xs text-muted-foreground border-t">
        Manage your back-end
      </div>
    </aside>
  )
}

export default SideMenu



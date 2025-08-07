"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  isActive: boolean
  isPending?: boolean
  color?: string
}

export function NavItem({ href, label, icon: Icon, isActive, isPending, color }: NavItemProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const content = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md my-3 p-2 text-sm transition-all text-white font-bold text-[1rem]",
        isActive
          ? "bg-white/20 font-bold shadow"
          : "opacity-80 hover:bg-white/10 hover:opacity-100",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("h-6 w-6 min-h-[1.25rem] min-w-[1.25rem]", color || (isActive ? "text-white" : "text-white/80 group-hover:text-white"))} />
      {!isCollapsed && label}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
} 
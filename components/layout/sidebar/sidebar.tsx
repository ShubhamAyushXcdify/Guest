"use client"

import { usePathname } from "next/navigation"
import {
    Menu,
    LogOut,
    ChevronDown,
    PawPrint
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupLabel, useSidebar } from "@/components/ui/sidebar"
import { NavItem } from "../nav-item"
import { useRootContext } from "@/context/RootContext"
import { navGroups } from "./constant"
import { useCheckPermission } from "./useCheckPermission"

export function Sidebar() {
    const { state, isMobile, openMobile, setOpenMobile } = useSidebar()
    const { handleLogout, IsAdmin, user } = useRootContext()
    const { checkPermission } = useCheckPermission(user)
    const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
        "Core Operations": true,
        "Products & Services": true,
        "Analytics": true,
        "Administration": true,
        "Settings": true,
    })
    const pathname = usePathname()

    const toggleGroup = (groupTitle: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupTitle]: !prev[groupTitle]
        }))
    }

    // Single group for all nav items
    const renderNavItems = () => (
        <nav className="space-y-1 px-3">
            {navGroups.map((group) => {

                return (
                    <SidebarGroup key={group.title}>
                        {checkPermission(group.allowedRoles) && (
                            <Collapsible
                                open={expandedGroups[group.title]}
                                onOpenChange={() => toggleGroup(group.title)}
                            >
                                <SidebarGroupLabel>
                                    <CollapsibleTrigger className={cn(
                                        "flex w-full items-center justify-between font-medium rounded-md py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground text-clinical-operations",
                                        state === "collapsed" && "justify-center"
                                    )}>
                                        <div className={cn(
                                            "flex items-center gap-2",
                                            state === "collapsed" && "justify-center"
                                        )}>
                                            <group.icon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem]" />
                                            {state !== "collapsed" && <span>{group.title}</span>}
                                        </div>
                                        {state !== "collapsed" && (
                                            <ChevronDown
                                                className={`h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] transition-transform duration-200 ${expandedGroups[group.title] ? "rotate-180" : ""
                                                    }`}
                                            />
                                        )}
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <div className={cn(
                                        "mt-2 space-y-1",
                                        state === "collapsed" ? "pl-0" : "pl-3"
                                    )}>
                                        {group.items.map((item) => (
                                            checkPermission(item.allowedRoles) && (
                                                <NavItem
                                                    key={item.href}
                                                    href={item.href}
                                                    label={item.label}
                                                    icon={item.icon}
                                                    isActive={pathname === item.href}
                                                    color={item.color}
                                                />
                                            )
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </SidebarGroup>
                );
            })}
        </nav>
    )

    return (
        <>
            <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)] text-white">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:max-w-none bg-gradient-to-b from-[var(--theme-secondary)] to-[var(--theme-primary)] text-white">
                    <div className="flex items-center gap-2 text-lg font-bold text-white px-4 pt-2 pb-2">
                        <PawPrint className="h-6 w-6" />
                        <span>PawTrack Admin</span>
                    </div>
                    {renderNavItems()}
                </SheetContent>
            </Sheet>
            <aside className={cn(
                "hidden md:flex flex-col justify-between bg-gradient-to-b from-[var(--theme-secondary)] to-[var(--theme-primary)] text-white min-h-screen shadow-xl transition-all duration-200",
                state === "collapsed" ? "w-16" : "w-64"
            )}>
                <div>
                    <div className={cn(
                        "flex items-center gap-3 px-6 py-4 h-16",
                        state === "collapsed" && "justify-center px-2"
                    )}>
                        <PawPrint className="h-7 w-7 " />
                        {state !== "collapsed" && (
                            <span className="text-xl font-bold tracking-tight">PawTrack</span>
                        )}
                    </div>

                    <Separator className="mb-6 bg-white/10" />

                    {renderNavItems()}
                </div>

                <div className="mt-auto mb-6">
                    <Separator className="my-4 bg-white/10" />
                    <div className="px-3">
                        <div className={cn(
                            "flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors",
                            state === "collapsed" && "justify-center"
                        )}>
                            <Avatar className="h-10 w-10 ring-2 ring-[var(--theme-accent)]/30 rounded-full flex items-center justify-center">
                                <AvatarImage src="/placeholder-user.jpg" alt="User" className="rounded-full" />
                                <AvatarFallback className="text-white">{user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || ''}</AvatarFallback>
                            </Avatar>
                            {state !== "collapsed" && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-white/70 truncate">{user?.email}</p>
                                </div>
                            )}
                            {state !== "collapsed" && (
                                <div onClick={handleLogout}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10">
                                        <LogOut className="h-4 w-4" />
                                        <span className="sr-only">Log out</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

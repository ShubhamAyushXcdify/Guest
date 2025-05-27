"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Package,
    Menu,
    LayoutDashboard,
    Ship,
    Users,
    Wallet,
    Database,
    BarChart3,
    LogOut,
    ChevronDown,
    ClipboardList,
    FlaskConical,
    Shield,
    Settings,
    Home,
    Calendar,
    Pill,
    FileText,
    PieChart,
    PawPrint,
    Settings2,
    Building
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupLabel, useSidebar } from "@/components/ui/sidebar"
import { NavItem } from "./nav-item"

const navItems = [
    { name: "Dashboard", icon: Home, href: "/dashboard" },
    { name: "Appointments", icon: Calendar, href: "/appointments" },
    { name: "Patients", icon: Users, href: "/patients" },
    { name: "Inventory", icon: Package, href: "/inventory" },
    { name: "Prescriptions", icon: Pill, href: "/prescriptions" },
    { name: "Billing", icon: FileText, href: "/billing" },
    { name: "Reports", icon: PieChart, href: "/reports" },
    { name: "Settings", icon: Settings, href: "/settings" },
]


const navGroups = [
    {
        title: "Core Operations",
        icon: ClipboardList,
        items: [
            {
                href: "/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard,
                color: "text-blue-500",
            },
            {
                href: "/appointments",
                label: "Appointments",
                icon: Calendar,
                color: "text-blue-500",
            },
            {
                href: "/patients",
                label: "Patients",
                icon: Users,
                color: "text-blue-500",
            },
            {
                href: "/inventory",
                label: "Inventory",
                icon: Package,
                color: "text-blue-500",
            },
            {
                href: "/prescriptions",
                label: "Prescriptions",
                icon: Pill,
                color: "text-blue-500",
            },
        ],
    },
    {
        title: "Products & Services",
        icon: FlaskConical,
        items: [
            {
                href: "/billing",
                label: "Billing",
                icon: FileText,
                color: "text-purple-500",
            },
            {
                href: "/reports",
                label: "Reports",
                icon: PieChart,
                color: "text-purple-500",
            },
            // {
            //   href: "/dashboard/shipments",
            //   label: "Shipments",
            //   icon: Database,
            //   color: "text-purple-500",
            // },
        ],
    },
    {
        title: "Administration",
        icon: Settings2,
        items: [
            {
                href: "/clinic",
                label: "Clinics",
                icon: Building,
                color: "text-purple-500",
            },
            {
                href: "/users",
                label: "Users",
                icon: Users,
                color: "text-purple-500",
            },
            {
                href: "/products",
                label: "Products",
                icon: Package,
                color: "text-purple-500",
            },
            {
                href: "/supplier",
                label: "Suppliers",
                icon: Users,
                color: "text-purple-500",
            }
        ],
    },
    {
        title: "Settings",
        icon: Settings2,
        items: [
            {
                href: "/settings",
                label: "Settings",
                icon: Settings,
                color: "text-green-500",
            },
        ],
    },
]

export function Sidebar() {
    const { state, isMobile, openMobile, setOpenMobile } = useSidebar()
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
            {navGroups.map((group) => (
                <SidebarGroup key={group.title}>
                    <Collapsible
                        open={expandedGroups[group.title]}
                        onOpenChange={() => toggleGroup(group.title)}
                    >
                        <SidebarGroupLabel>
                            <CollapsibleTrigger className="flex w-full items-center justify-between font-medium rounded-md px-2 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground text-clinical-operations">
                                <div className="flex items-center gap-2">
                                    <group.icon className="h-4 w-4" />
                                    {state !== "collapsed" && <span>{group.title}</span>}
                                </div>
                                {state !== "collapsed" && (
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform duration-200 ${expandedGroups[group.title] ? "rotate-180" : ""
                                            }`}
                                    />
                                )}
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <div className="mt-2 space-y-1 pl-3">
                                {group.items.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        href={item.href}
                                        label={item.label}
                                        icon={item.icon}
                                        isActive={pathname === item.href}
                                        color={item.color}
                                    />
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarGroup>
            ))}
        </nav>
    )

    return (
        <>
            <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:max-w-none bg-gradient-to-b from-purple-600 to-indigo-600 text-white">
                    <div className="flex items-center gap-2 text-lg font-bold text-white px-4 pt-2 pb-2">
                        <PawPrint className="h-6 w-6" />
                        <span>PawTrack Admin</span>
                    </div>
                    {renderNavItems()}
                </SheetContent>
            </Sheet>
            <aside className={cn(
                "hidden md:flex flex-col justify-between bg-gradient-to-b from-indigo-700 to-indigo-900 text-white min-h-screen shadow-xl transition-all duration-200",
                state === "collapsed" ? "w-16" : "w-64"
            )}>
                <div>
                    <div className={cn(
                        "flex items-center gap-3 px-6 py-4 h-16",
                        state === "collapsed" && "justify-center px-2"
                    )}>
                        <PawPrint className="h-7 w-7 text-indigo-300" />
                        {state !== "collapsed" && (
                            <span className="text-xl font-bold tracking-tight">PawTrack</span>
                        )}
                    </div>

                    <Separator className="mb-6 bg-indigo-600/40" />

                    {renderNavItems()}
                </div>

                <div className="mt-auto mb-6">
                    <Separator className="my-4 bg-indigo-600/40" />
                    <div className="px-3">
                        <div className={cn(
                            "flex items-center gap-3 p-3 rounded-lg bg-indigo-800/50 hover:bg-indigo-800 transition-colors",
                            state === "collapsed" && "justify-center"
                        )}>
                            <Avatar className="h-10 w-10 ring-2 ring-indigo-400/30 rounded-full flex items-center justify-center">
                                <AvatarImage src="/placeholder-user.jpg" alt="User" className="rounded-full" />
                                <AvatarFallback className="text-white">AD</AvatarFallback>
                            </Avatar>
                            {state !== "collapsed" && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">Admin User</p>
                                    <p className="text-xs text-indigo-300 truncate">admin@example.com</p>
                                </div>
                            )}
                            {state !== "collapsed" && (
                                <Link href="/">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-indigo-700">
                                        <LogOut className="h-4 w-4" />
                                        <span className="sr-only">Log out</span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

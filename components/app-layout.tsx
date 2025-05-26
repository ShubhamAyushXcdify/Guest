"use client"

import { useState, useEffect } from "react"
import { TopBar } from "@/components/top-bar"
import PatientSidebar from "@/components/patient-sidebar"

export function AppLayout({ children }) {
  const [colorTheme, setColorTheme] = useState("purple")
  const [mounted, setMounted] = useState(false)

  // Ensure we only access localStorage on the client side
  useEffect(() => {
    setMounted(true)
    const savedColorTheme = localStorage.getItem("pawtrack-color-theme") || "purple"
    setColorTheme(savedColorTheme)
    document.documentElement.setAttribute("data-color-theme", savedColorTheme)
  }, [])

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 theme-${colorTheme}`}>
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

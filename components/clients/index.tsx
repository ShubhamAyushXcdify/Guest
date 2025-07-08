"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ClientsScreen } from "./clients-screen"
import { RegisteredClientsScreen } from "@/components/registredClients"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet"
import { ClientDrawerContent } from "./clientDrawer"
import { Client } from "@/queries/clients/get-client"

export default function ClientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeView, setActiveView] = useState("owners")
  const [mounted, setMounted] = useState(false)
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  // Ensure we only access localStorage and URL params on the client side
  useEffect(() => {
    setMounted(true)
    const view = searchParams.get("view") || "owners"
    setActiveView(view)
  }, [searchParams])

  const handleViewChange = (view: string) => {
    setActiveView(view)
    // Force replace the entire URL with just the view parameter
    window.history.replaceState(null, '', `/clients?view=${view}`);
  }

  const handleEditClient = (client?: Client | null) => {
    setSelectedClient(client || null);
    setIsClientDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsClientDrawerOpen(false);
    setSelectedClient(null);
  };

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  return (
    <>
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent mb-4">
            {activeView === "owners" && "Pet Owners"}
            {activeView === "registered" && "Registered Clients"}
          </h1>
        </div>
        {activeView === "owners" && (
          <Button
            className={`theme-button text-white`}
            onClick={() => handleEditClient(null)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Owner
          </Button>
        )}
      </div>

      {/* View Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <nav className="flex -mb-px">
          <button
            onClick={() => handleViewChange("owners")}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${activeView === "owners"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600"
              }`}
          >
            Pet Owners
          </button>
          <button
            onClick={() => handleViewChange("registered")}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${activeView === "registered"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600"
              }`}
          >
            Registered Clients
          </button>
        </nav>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
        {activeView === "owners" && <ClientsScreen onEditClient={handleEditClient} />}
        {activeView === "registered" && <RegisteredClientsScreen />}
      </div>

      {/* New/Edit Client Sheet */}
      <Sheet open={isClientDrawerOpen} onOpenChange={setIsClientDrawerOpen}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[40%] overflow-auto">
          <SheetHeader>
            <SheetTitle>{selectedClient ? "Update Owner" : "New Owner"}</SheetTitle>
          </SheetHeader>
          <ClientDrawerContent 
            onClose={handleDrawerClose} 
            defaultValues={selectedClient || undefined}
            isUpdate={!!selectedClient} 
          />
        </SheetContent>
      </Sheet>
    </>
  )
} 
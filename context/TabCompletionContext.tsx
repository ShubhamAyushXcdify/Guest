"use client"

import { createContext, useContext, useState, ReactNode } from "react"

// Define tab IDs
export type TabId = "intake" | "cc-hpi" | "medical-history" | "vitals" | "procedure" | "assessment" | "plan"

interface TabCompletionContextType {
  completedTabs: TabId[]
  markTabAsCompleted: (tabId: TabId) => void
  isTabCompleted: (tabId: TabId) => boolean
  allTabsCompleted: () => boolean
}

const TabCompletionContext = createContext<TabCompletionContextType | undefined>(undefined)

export function TabCompletionProvider({ children }: { children: ReactNode }) {
  const [completedTabs, setCompletedTabs] = useState<TabId[]>([])

  const markTabAsCompleted = (tabId: TabId) => {
    setCompletedTabs(prev => {
      if (!prev.includes(tabId)) {
        return [...prev, tabId]
      }
      return prev
    })
  }

  const isTabCompleted = (tabId: TabId) => {
    return completedTabs.includes(tabId)
  }

  const allTabsCompleted = () => {
    // These are the tabs that must be completed before checkout
    const requiredTabs: TabId[] = ["intake", "cc-hpi", "medical-history", "vitals", "procedure", "assessment"]
    
    // Check if all required tabs are completed
    return requiredTabs.every(tab => completedTabs.includes(tab))
  }

  return (
    <TabCompletionContext.Provider value={{
      completedTabs,
      markTabAsCompleted,
      isTabCompleted,
      allTabsCompleted
    }}>
      {children}
    </TabCompletionContext.Provider>
  )
}

export function useTabCompletion() {
  const context = useContext(TabCompletionContext)
  if (context === undefined) {
    throw new Error("useTabCompletion must be used within a TabCompletionProvider")
  }
  return context
} 
"use client"

import { useRootContext } from "@/context/RootContext"

interface DashboardWelcomeHeaderProps {
  date: Date;
}

export const DashboardWelcomeHeader = ({ date }: DashboardWelcomeHeaderProps) => {
  const { user } = useRootContext();
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {userName}</h1>
      <p className="text-gray-600 dark:text-gray-400">{formattedDate}</p>
    </div>
  )
} 
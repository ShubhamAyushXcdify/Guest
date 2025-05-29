"use client"

export const DashboardWelcomeHeader = () => {
  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, Dr. Smith</h1>
      <p className="text-gray-600 dark:text-gray-400">{formattedDate}</p>
    </div>
  )
} 
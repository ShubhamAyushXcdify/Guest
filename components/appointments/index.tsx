"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"

import RoomView from "./room-view"
import WaitingRoom from "./waiting-room"
import ProviderView from "./provider-view"
import { Button } from "@/components/ui/button"
import AppointmentList from "./appointment-list"
import AppointmentCalendar from "./appointment-calendar"
import NewAppointment from "./newAppointment"
import AppointmentDetails from "./appointment-details"

export default function AppointmentsPage() {
    const router = useRouter()
    const [appointmentId, setappointmentId] = useState<string | null>(null);

    const searchParams = useSearchParams()
    const [activeView, setActiveView] = useState("list")
    const [mounted, setMounted] = useState(false)
    const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)

    // Ensure we only access localStorage on the client side
    useEffect(() => {
        setMounted(true)
        const view = searchParams.get("view") || "list"
        setActiveView(view)
    }, [searchParams])

    const handleViewChange = (view: string) => {
        setActiveView(view)
        router.push(`/appointments?view=${view}`)
    }


    const handleAppointmentClick = useCallback((id: string | number) => {
        setappointmentId(id.toString())
    }, [])

    // If not mounted yet, don't render to avoid hydration mismatch
    if (!mounted) return null

    return (
        <>
            <div className="flex justify-between items-center p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {activeView === "list" && "Appointment List"}
                    {activeView === "calendar" && "Appointment Calendar"}
                    {activeView === "provider" && "Provider View"}
                    {activeView === "room" && "Room View"}
                    {activeView === "waiting" && "Waiting Room"}
                </h1>
                <Button
                    className="theme-button text-white"
                    onClick={() => setIsNewAppointmentOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" /> New Appointment
                </Button>
            </div>

            {/* View Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                    <button
                        onClick={() => handleViewChange("calendar")}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeView === "calendar"
                            ? "border-theme-primary text-theme-primary dark:text-white"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Calendar View
                    </button>
                    <button
                        onClick={() => handleViewChange("list")}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeView === "list"
                            ? "border-theme-primary text-theme-primary dark:text-white"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => handleViewChange("provider")}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeView === "provider"
                            ? "border-theme-primary text-theme-primary dark:text-white"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Provider View {appointmentId}
                    </button>
                    <button
                        onClick={() => handleViewChange("room")}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeView === "room"
                            ? "border-theme-primary text-theme-primary dark:text-white"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Room View
                    </button>
                    <button
                        onClick={() => handleViewChange("waiting")}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeView === "waiting"
                            ? "border-theme-primary text-theme-primary dark:text-white"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Waiting Room
                    </button>
                </nav>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-auto">
                {activeView === "list" && <AppointmentList onAppointmentClick={handleAppointmentClick} />}
                {activeView === "calendar" && <AppointmentCalendar onAppointmentClick={handleAppointmentClick} />}
                {activeView === "provider" && <ProviderView onAppointmentClick={handleAppointmentClick} />}
                {activeView === "room" && <RoomView onAppointmentClick={handleAppointmentClick} />}
                {activeView === "waiting" && <WaitingRoom onAppointmentClick={handleAppointmentClick} />}
            </div>

            {/* New Appointment Drawer */}
            <NewAppointment
                isOpen={isNewAppointmentOpen}
                onClose={() => setIsNewAppointmentOpen(false)}
            />
            {appointmentId && <AppointmentDetails appointmentId={appointmentId} onClose={() => setappointmentId(null)} />}
        </>
    )
}

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
import { PatientSearch, Patient } from "./patient-search"
import { useRootContext } from "@/context/RootContext"

export default function AppointmentsPage() {
    const router = useRouter()
    const { user, userType } = useRootContext()
    const [appointmentId, setappointmentId] = useState<string | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

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

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient)
        // Log for debugging
        console.log("Selected patient:", patient)
        console.log("Patient ID for filtering:", patient.id)
    }

    const clearPatientFilter = () => {
        setSelectedPatient(null)
        console.log("Patient filter cleared")
    }

    // If not mounted yet, don't render to avoid hydration mismatch
    if (!mounted) return null

    return (
        <>
            <div className="flex justify-between items-center p-6">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                        {activeView === "list" && "Appointment List"}
                        {activeView === "calendar" && "Appointment Calendar"}
                        {activeView === "provider" && "Provider View"}
                        {/* {activeView === "room" && "Room View"}
                        {activeView === "waiting" && "Waiting Room"} */}
                    </h1>
                    <div className="max-w-xl">
                        <PatientSearch 
                            onPatientSelect={handlePatientSelect} 
                            className="mb-2" 
                        />
                        {selectedPatient && (
                            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-md">
                                <span>Filtering appointments for: <strong>{selectedPatient.name}</strong></span>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="ml-2 h-6 w-6 p-0"
                                    onClick={clearPatientFilter}
                                >
                                    <span className="sr-only">Clear filter</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
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
                        onClick={() => handleViewChange("list")}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeView === "list"
                            ? "border-theme-primary text-theme-primary dark:text-white"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        List View
                    </button>
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
                        onClick={() => handleViewChange("provider")}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeView === "provider"
                            ? "border-theme-primary text-theme-primary dark:text-white"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Provider View
                    </button>
                    {/* <button
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
                    </button> */}
                </nav>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-auto">
                {activeView === "list" && <AppointmentList 
                    onAppointmentClick={handleAppointmentClick} 
                    selectedPatientId={selectedPatient?.id}
                />}
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

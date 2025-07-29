"use client"
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { PatientDashboardContext } from "./PatientDashboardProvider";
import { LogOut } from "lucide-react";

export default function Header() {
  const { clientData, handleLogout } = useContext(PatientDashboardContext);
  return (
    <header className="h-16 bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-blue-200 shadow-sm flex items-center justify-between px-6">
      <div className="font-semibold text-lg text-blue-800">
        {clientData ? `Welcome, ${clientData.firstName} ${clientData.lastName}` : "PawTrack Dashboard"}
      </div>
      <Button 
        variant="outline" 
        onClick={handleLogout}
        className="bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 rounded-full p-2 h-10 w-10 shadow-sm transition-all duration-200"
        title="Logout"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
} 
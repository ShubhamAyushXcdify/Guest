"use client"
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { PatientDashboardContext } from "./PatientDashboardProvider";

export default function MobileHeader() {
  const { setIsSidebarOpen } = useContext(PatientDashboardContext);

  return (
    <header className="h-16 bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-blue-200 shadow-sm flex items-center px-4 gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsSidebarOpen(true)}
        className="p-2"
      >
        <Menu className="h-5 w-5 text-blue-600" />
      </Button>
      <div className="font-semibold text-base text-blue-800 truncate">
        PawTrack Dashboard
      </div>
      <div className="w-10"></div> {/* Spacer for centering */}
    </header>
  );
} 
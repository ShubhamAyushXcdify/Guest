"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, PawPrint, Heart, Calendar, LogOut, MapPin } from "lucide-react";
import { useContext } from "react";
import { PatientDashboardContext } from "./PatientDashboardProvider";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/patientdashboard/overview", label: "Overview", icon: CalendarDays },
  { href: "/patientdashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/patientdashboard/mypets", label: "My Pets", icon: PawPrint },
  { href: "/patientdashboard/records", label: "Medical Records", icon: Heart },
  { href: "/patientdashboard/findclinic", label: "Find Clinic", icon: MapPin },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { handleLogout } = useContext(PatientDashboardContext);

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-50 border-r border-blue-200 shadow-sm">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center bg-white border-b border-blue-100 py-2">
        <img src="/images/logoPawTrack.png" alt="PawTrack Logo" className="h-full w-fit" />
      </div>
      {/* Navigation */}
      <nav className="flex-1 py-8 px-2">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link href={href} legacyBehavior>
                  <a
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-lg font-medium transition-all duration-200
                      ${isActive
                        ? "bg-blue-100 text-blue-800 border-l-4 border-blue-500 shadow-sm"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-l-4 hover:border-blue-300"}
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-blue-400"}`} />
                    <span className="truncate text-base">{label}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Footer with Logout for Mobile */}
      <div className="mt-auto py-5 px-6 border-t border-blue-100 bg-white">
        {/* Mobile Logout Button */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 rounded-lg py-2.5 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        <div className="text-xs text-gray-500 text-center">
          &copy; {new Date().getFullYear()} PawTrack<br />All rights reserved.
        </div>
      </div>
    </aside>
  );
} 
import Header from "@/components/patientDashboard/Header";
import MobileHeader from "@/components/patientDashboard/MobileHeader";
import { PatientDashboardProvider } from "@/components/patientDashboard/PatientDashboardProvider";
import Sidebar from "@/components/patientDashboard/Sidebar";
import { SidebarWrapper } from "@/components/patientDashboard/SidebarWrapper";
import { NotificationInitializer } from "@/components/notification-bell/NotificationInitializer";
import { NotificationListener } from "@/components/notification-bell/NotificationListener";



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PatientDashboardProvider>
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar Sheet */}
        <SidebarWrapper />

        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="md:hidden">
            <MobileHeader />
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block">
            <Header />
          </div>

          <main className="flex-1 p-4 bg-gray-50 h-full max-h-[calc(100vh-4rem)] overflow-y-auto">{children}</main>
        </div>
      </div>
      
      {/* Notification components for real-time updates */}
      <NotificationInitializer />
      <NotificationListener />
    </PatientDashboardProvider>
  );
}

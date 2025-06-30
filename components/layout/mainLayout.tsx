'use client'
import withAuth from "@/utils/privateRouter";
import { SidebarProvider } from "../ui/sidebar";
import { Header } from "./header";
import { Sidebar } from "./sidebar/sidebar";

function MainLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen">
            <SidebarProvider>
                <Sidebar />
                <div className="flex-1">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </div>
    )
}

export default withAuth(MainLayout);
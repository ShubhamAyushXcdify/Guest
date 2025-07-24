'use client'
import withAuth from "@/utils/privateRouter";
import { SidebarProvider } from "../ui/sidebar";
import { Header } from "./header";
import { Sidebar } from "./sidebar/sidebar";
import AuthProvider from "@/provider/AuthProvider";

function MainLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen">
            <AuthProvider>
                <SidebarProvider>
                    <Sidebar />
                    <div className="flex-1">
                        <Header />
                        <main className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-6rem)]">
                            {children}
                        </main>
                    </div>
                </SidebarProvider>
            </AuthProvider>
        </div>
    )
}

export default withAuth(MainLayout);
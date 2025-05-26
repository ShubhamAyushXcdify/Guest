'use client'
import { QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "../ui/sidebar";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { QueryClient } from "@tanstack/react-query";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient();
    return (
        <div className="flex h-screen">
            <QueryClientProvider client={queryClient}>
                <SidebarProvider>
                    <Sidebar />
                    <div className="flex-1">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
                        {children}
                    </main>
                    </div>
                </SidebarProvider>
            </QueryClientProvider>
        </div>
    )
}
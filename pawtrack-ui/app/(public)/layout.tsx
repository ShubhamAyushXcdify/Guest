import AuthProvider from "@/provider/AuthProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <main className="min-h-screen bg-gradient-to-br from-[#D2EFEC] via-white to-[#D2EFEC]">
                {children}
            </main>
        </AuthProvider>
    )
}

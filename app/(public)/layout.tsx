import AuthProvider from "@/provider/AuthProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {children}
            </main>
        </AuthProvider>
    )
}

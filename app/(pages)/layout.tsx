import MainLayout from "@/components/layout/mainLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <MainLayout>
            {children}
        </MainLayout>
    )
}

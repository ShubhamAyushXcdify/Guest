'use client'
import RootPageContext from "@/context/RootContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


export default function QueryWrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <RootPageContext>
                {children}
            </RootPageContext>
        </QueryClientProvider>
    );
}
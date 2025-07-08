"use client";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleTabChange = (value: string) => {
        router.push(`/appointments/${value}`);
    }

    return (
        <div className="w-full">
            <Tabs defaultValue={pathname.split("/").pop() || "confirmed"} className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                    <TabsTrigger value="queue">Registered</TabsTrigger>
                </TabsList>
                <TabsContent value={pathname.split("/").pop() || "confirmed"} className="mt-2">
                    {children}
                </TabsContent>
            </Tabs>
        </div>
    )
}
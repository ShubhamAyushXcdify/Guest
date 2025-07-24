"use client";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Extract current tab from pathname
    const currentTab = pathname.split("/").pop() || "confirmed";

    // Handle tab change
    const handleTabChange = (value: string) => {
        if (value !== currentTab) {
            router.push(`/appointments/${value}`);
        }
    };

    return (
        <div className="w-full">
            <Tabs value={currentTab} className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                    <TabsTrigger value="queue">Registered</TabsTrigger>
                </TabsList>

                <TabsContent value="confirmed">
                    {currentTab === "confirmed" && children}
                </TabsContent>
                <TabsContent value="queue">
                    {currentTab === "queue" && children}
                </TabsContent>
            </Tabs>
        </div>
    );
}

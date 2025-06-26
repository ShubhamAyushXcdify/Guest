'use client'
import Slots from "@/components/clinic/details/rooms/slots";
import { useParams } from "next/navigation";
 
export default function SlotsPage() {
    const params = useParams();
    const clinicId = params.id as string;
    const roomId = params.roomId as string;
 
    return (
        <div>
            <Slots roomId={roomId} clinicId={clinicId} />
        </div>
    )
} 
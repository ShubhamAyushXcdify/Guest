'use client'

import ClientDetails from "@/components/clients/client-details";
import { useParams } from "next/navigation";
import { useRootContext } from "@/context/RootContext";

export default function ClientDetailsPage() {
    const params = useParams();
    const clientId = params.id as string;
    const { userType, loading } = useRootContext();

    if (loading) {
      return <div className="p-6">Loading permissions...</div>;
    }

    return (
        <div>
            <ClientDetails clientId={clientId} />
        </div>
    );
}

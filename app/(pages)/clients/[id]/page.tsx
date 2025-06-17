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

    if (!userType?.isAdmin && !userType?.isReceptionist) {
      return <div className="p-6 text-red-500">Permission Denied: You do not have access to view client details.</div>;
    }

    return (
        <div>
            <ClientDetails clientId={clientId} />
        </div>
    );
}

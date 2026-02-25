'use client'

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClinicDetailsPage() {
  const params = useParams();
  const clinicId = params.id as string;
  const router = useRouter();
  
  // Redirect to the rooms tab by default
  useEffect(() => {
    router.push(`/clinic/${clinicId}/rooms`);
  }, [clinicId, router]);
  
  return <div>Redirecting...</div>;
}

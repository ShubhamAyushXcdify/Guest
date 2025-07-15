'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SlotsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the slots management in clinic section
    router.push('/clinic');
  }, [router]);

  return (
    <div className="container mx-auto p-8 flex justify-center items-center h-96">
      <div className="animate-pulse text-center">
        <p>Redirecting to clinic slots management...</p>
      </div>
    </div>
  );
} 
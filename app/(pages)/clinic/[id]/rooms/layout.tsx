'use client'
import { ReactNode } from "react";

interface SlotsLayoutProps {
  children: ReactNode;
}

export default function SlotsLayout({ children }: SlotsLayoutProps) {
  return (
    <div className="w-full p-4">
      {children}
    </div>
  );
} 
import type React from "react"
import "@/app/globals.css"
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import localFont from "next/font/local";
import QueryWrapper from "@/components/layout/queryWrapper";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/provider/AuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={` antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <NuqsAdapter>
            <QueryWrapper>
              {children}
              <Toaster />
            </QueryWrapper>
          </NuqsAdapter>
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: "PawTrack - Clinic Management System",
  description: "Clinic Management System",
  icons: {
    icon: "/images/logo.png",
  },
};

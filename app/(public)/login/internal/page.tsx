"use client";

import type React from "react"
import Image from "next/image"
import { Moon, Sun } from "lucide-react"
import { signIn } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/auth/login/loginform"

export default function LoginPage() {

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{
        background: `linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%)`,
      }}
    >
      {/* Theme Dropdown */}
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 border-0 bg-white/10 text-white hover:bg-white/20">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </div>
      {/* Left side - Branding */}
      <div className="flex-1 flex flex-col justify-center items-center text-white">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            <div className="w-80">
              <Image src="/images/logo-white.png" alt="PawTrack Logo" fill className=" !relative w-40 " priority />
            </div>
            {/* <h1 className="text-4xl font-bold tracking-tight">PawTrack</h1>
            <p className="mt-2 text-xl">Veterinary Practice Management</p> */}
          </div>

          <div className="mt-10 hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Streamline Your Veterinary Practice</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm">✓</span>
                  </div>
                  <p>Manage appointments and patient records</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm">✓</span>
                  </div>
                  <p>Track inventory and prescriptions</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm">✓</span>
                  </div>
                  <p>Process billing and generate reports</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8 border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pet Health Portal</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your credentials to access your pet's health information</p>
          </div>
          
          {/* <div className="mb-6">
            <Button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-800 px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div> */}
          
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

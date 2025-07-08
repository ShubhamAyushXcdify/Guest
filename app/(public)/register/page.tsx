"use client";

import type React from "react"
import Image from "next/image"
import { Moon, Sun, Calendar, PawPrint, Heart, FileText, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { RegistrationForm } from "@/components/auth/register/registration-form"

export default function RegisterPage() {

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

        </DropdownMenu>
      </div>
      {/* Left side - Branding */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-6">
              <Image src="/images/logo.png" alt="PawTrack Logo" fill className="object-contain" priority />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">PawTrack</h1>
            <p className="mt-2 text-xl">Your Pet's Health Journey</p>
          </div>

          <div className="mt-10 hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Stay Connected with Your Pet's Care</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <p>View and manage your pet's appointments</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <PawPrint className="h-4 w-4" />
                  </div>
                  <p>Access your pet's medical records</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <Heart className="h-4 w-4" />
                  </div>
                  <p>Track vaccinations and treatments</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <Bell className="h-4 w-4" />
                  </div>
                  <p>Get appointment reminders and updates</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <FileText className="h-4 w-4" />
                  </div>
                  <p>View prescriptions and billing history</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl h-[calc(100vh-100px)] w-full p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to PawTrack</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create your account to access your pet's health portal</p>
          </div>
          
          <RegistrationForm />
        </div>
      </div>
    </div>
  )
} 
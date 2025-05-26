"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Mail, Check, Moon, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [colorTheme, setColorTheme] = useState("purple")

  const { theme, setTheme } = useTheme()

  // Theme options
  const themeOptions = [
    { name: "Purple (Default)", value: "purple", primaryColor: "bg-purple-600", secondaryColor: "bg-indigo-800" },
    { name: "Teal", value: "teal", primaryColor: "bg-teal-600", secondaryColor: "bg-teal-800" },
    { name: "Blue", value: "blue", primaryColor: "bg-blue-600", secondaryColor: "bg-blue-800" },
    { name: "Rose", value: "rose", primaryColor: "bg-rose-600", secondaryColor: "bg-rose-800" },
    { name: "Amber", value: "amber", primaryColor: "bg-amber-600", secondaryColor: "bg-amber-800" },
    { name: "Emerald", value: "emerald", primaryColor: "bg-emerald-600", secondaryColor: "bg-emerald-800" },
  ]

  // Ensure we only access localStorage on the client side
  useEffect(() => {
    setMounted(true)
    const savedColorTheme = localStorage.getItem("pawtrack-color-theme") || "purple"
    setColorTheme(savedColorTheme)
    document.documentElement.setAttribute("data-color-theme", savedColorTheme)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)

    // Simulate API call
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, accept any email with a valid format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error("Invalid email format")
      }

      // Success
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const changeColorTheme = (value: string) => {
    setColorTheme(value)
    localStorage.setItem("pawtrack-color-theme", value)
    document.documentElement.setAttribute("data-color-theme", value)
  }

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 relative"
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
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs font-normal text-gray-500">Mode</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Settings className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">Color Theme</DropdownMenuLabel>

            <DropdownMenuRadioGroup value={colorTheme} onValueChange={changeColorTheme}>
              {themeOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${option.primaryColor}`}></div>
                  <span>{option.name}</span>
                  {colorTheme === option.value && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <Image src="/images/logo.png" alt="PawTrack Logo" fill className="object-contain" priority />
          </div>
        </div>

        {isSubmitted ? (
          <div className="space-y-6">
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <AlertTitle className="text-green-800 dark:text-green-400">Check your email</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-500">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the
                instructions.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Link href="/">
                <Button variant="outline" className="mt-4 flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Enter your email and we'll send you a link to reset your password
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@clinic.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full theme-button text-white" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>

              <div className="text-center">
                <Link href="/" className={cn("text-sm font-medium hover:underline", "theme-text-accent")}>
                  Back to login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

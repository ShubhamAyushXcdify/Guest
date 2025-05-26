"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, Building, Check, Moon, Settings, Sun } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [clinicName, setClinicName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [colorTheme, setColorTheme] = useState("purple")

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword || !clinicName) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    // Simulate registration - in a real app, this would be an API call
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, validate email format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error("Invalid email format")
      }

      // Success - redirect to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
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
      {/* Left side - Branding */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-6">
              <Image src="/images/logo.png" alt="PawTrack Logo" fill className="object-contain" priority />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">PawTrack</h1>
            <p className="mt-2 text-xl">Veterinary Practice Management</p>
          </div>

          <div className="mt-10 hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Join thousands of veterinary practices</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm">✓</span>
                  </div>
                  <p>Free 30-day trial, no credit card required</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm">✓</span>
                  </div>
                  <p>Dedicated onboarding support</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm">✓</span>
                  </div>
                  <p>Cancel anytime, export your data</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Start your 30-day free trial</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. John Smith"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic">Clinic Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="clinic"
                  type="text"
                  placeholder="Smith Veterinary Clinic"
                  className="pl-10"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                I agree to the{" "}
                <Link href="/terms" className={cn("font-medium hover:underline", "theme-text-accent")}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className={cn("font-medium hover:underline", "theme-text-accent")}>
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full theme-button text-white" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/" className={cn("font-medium hover:underline", "theme-text-accent")}>
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

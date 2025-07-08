"use client";

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Moon, Sun, Calendar, Heart, FileText, Shield, Phone, Mail, MapPin, ArrowRight, CheckCircle, Star, Clock, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"

  export default function LandingPage() {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden overflow-y-auto max-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8">
                <Image src="/images/logo.png" alt="PawTrack Logo" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">PawTrack</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Services</a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">About</a>
              <a href="#doctors" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Our Doctors</a>
              <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
      
              <Link href="/patientdashboard">
                <Button variant="outline" className="hidden sm:inline-flex">
                  Patient Portal
                </Button>
              </Link>
              <Link href="/login/internal">
                <Button variant="ghost" className="hidden md:inline-flex text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Staff Login
                </Button>
              </Link>
                <Link href="/patientdashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Book Appointment
                  </Button>
                </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Expert Care for Your
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Beloved Pets</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Trust your furry family members to our experienced veterinary team. 
                  We provide compassionate care, advanced treatments, and a welcoming environment for pets and their owners.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
                    Book Your First Appointment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Emergency Care
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Same-day appointments available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Emergency services 24/7</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="/images/logo.png" 
                  alt="Happy pets with veterinarian" 
                  fill 
                  className="object-cover"
                  priority 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Pet Care Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From routine checkups to specialized treatments, we provide complete veterinary care 
              to keep your pets healthy and happy throughout their lives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Wellness Exams</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Regular checkups, vaccinations, and preventive care to keep your pets healthy.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Emergency Care</h3>
              <p className="text-gray-600 dark:text-gray-300">
                24/7 emergency services for urgent medical situations and critical care.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Surgery & Procedures</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced surgical procedures with state-of-the-art equipment and expert care.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Dental Care</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Professional dental cleaning, extractions, and oral health maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Your First Appointment Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Give Your Pet the Best Care?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of pet parents who trust us with their beloved companions. 
              Book your first appointment today and experience compassionate, professional care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
                  Get Your First Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                Why Pet Parents Choose Us
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                We understand that your pets are family. That's why we provide personalized care 
                with compassion, expertise, and the latest veterinary technology to ensure the best outcomes.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Experienced Veterinarians</h3>
                    <p className="text-gray-600 dark:text-gray-300">Board-certified doctors with years of experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Modern Facility</h3>
                    <p className="text-gray-600 dark:text-gray-300">State-of-the-art equipment and comfortable environment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Compassionate Care</h3>
                    <p className="text-gray-600 dark:text-gray-300">We treat every pet like our own family member</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 italic">
                    "The care my dog received was exceptional. The staff was so kind and professional. 
                    I couldn't be happier with the treatment and follow-up care."
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Sarah M.</p>
                    <p className="text-gray-600 dark:text-gray-400">Happy Pet Parent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">15+</div>
              <div className="text-gray-600 dark:text-gray-300">Years of Experience</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Happy Pets Treated</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Emergency Care</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">98%</div>
              <div className="text-gray-600 dark:text-gray-300">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8">
                  <Image src="/images/logo.png" alt="PawTrack Logo" fill className="object-contain" />
                </div>
                <span className="text-xl font-bold">PawTrack</span>
              </div>
              <p className="text-gray-400">
                Providing compassionate veterinary care for your beloved pets. 
                Your pet's health and happiness are our top priorities.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">Wellness Exams</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Emergency Care</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Surgery</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Dental Care</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">Our Team</a></li>
                <li><a href="#doctors" className="hover:text-white transition-colors">Our Doctors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facility</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact & Hours</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@pawtrack.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>123 Pet Care Ave, Pet City, PC 12345</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 PawTrack Veterinary Clinic. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

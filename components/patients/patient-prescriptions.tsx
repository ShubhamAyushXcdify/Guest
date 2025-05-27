"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, Download, FileText, Plus, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PatientPrescriptions() {
  const [date, setDate] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const activePrescriptions = [
    {
      id: 1,
      medication: "Heartgard Plus",
      dosage: "1 chew",
      frequency: "Monthly",
      startDate: "Jan 1, 2025",
      endDate: "Ongoing",
      refills: 11,
      prescribedBy: "Dr. Sarah Johnson",
      status: "active",
    },
    {
      id: 2,
      medication: "NexGard",
      dosage: "1 chew (28-60kg)",
      frequency: "Monthly",
      startDate: "Jan 1, 2025",
      endDate: "Ongoing",
      refills: 11,
      prescribedBy: "Dr. Sarah Johnson",
      status: "active",
    },
    {
      id: 3,
      medication: "Amoxicillin",
      dosage: "250mg",
      frequency: "Twice daily",
      startDate: "May 1, 2025",
      endDate: "May 14, 2025",
      refills: 0,
      prescribedBy: "Dr. Michael Chen",
      status: "active",
    },
  ]

  const historicalPrescriptions = [
    {
      id: 4,
      medication: "Metronidazole",
      dosage: "250mg",
      frequency: "Twice daily",
      startDate: "Nov 10, 2024",
      endDate: "Nov 20, 2024",
      refills: 0,
      prescribedBy: "Dr. Sarah Johnson",
      status: "completed",
    },
    {
      id: 5,
      medication: "Prednisone",
      dosage: "5mg",
      frequency: "Once daily, tapering dose",
      startDate: "Oct 5, 2024",
      endDate: "Oct 25, 2024",
      refills: 0,
      prescribedBy: "Dr. Michael Chen",
      status: "completed",
    },
  ]

  const allPrescriptions = [...activePrescriptions, ...historicalPrescriptions]

  const filteredPrescriptions = allPrescriptions.filter((prescription) => {
    const matchesSearch = searchTerm === "" || 
                          prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prescription.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Current Medications */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Medications</h3>
            <Button className="theme-button text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Prescription
            </Button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{prescription.medication}</h4>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</Badge>
                  </div>
                  
                  <dl className="space-y-1 text-sm">
                    <div className="grid grid-cols-3">
                      <dt className="text-gray-500 dark:text-gray-400">Dosage:</dt>
                      <dd className="col-span-2 text-gray-900 dark:text-gray-200">{prescription.dosage}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-gray-500 dark:text-gray-400">Frequency:</dt>
                      <dd className="col-span-2 text-gray-900 dark:text-gray-200">{prescription.frequency}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-gray-500 dark:text-gray-400">Start date:</dt>
                      <dd className="col-span-2 text-gray-900 dark:text-gray-200">{prescription.startDate}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-gray-500 dark:text-gray-400">End date:</dt>
                      <dd className="col-span-2 text-gray-900 dark:text-gray-200">{prescription.endDate}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-gray-500 dark:text-gray-400">Refills left:</dt>
                      <dd className="col-span-2 text-gray-900 dark:text-gray-200">{prescription.refills}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-gray-500 dark:text-gray-400">Prescribed by:</dt>
                      <dd className="col-span-2 text-gray-900 dark:text-gray-200">{prescription.prescribedBy}</dd>
                    </div>
                  </dl>
                  
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8">Refill</Button>
                    <Button variant="outline" size="sm" className="h-8">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication History */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prescription History</h3>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Label htmlFor="search-prescriptions" className="sr-only">Search</Label>
              <Input
                id="search-prescriptions"
                placeholder="Search prescriptions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 top-2 h-5 w-5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div>
              <Label htmlFor="status-filter" className="sr-only">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-filter" className="sr-only">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-filter"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <div className="px-4 pt-4">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="p-0 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Medication
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Dosage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Refills
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredPrescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {prescription.medication}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {prescription.dosage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {prescription.frequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-gray-900 dark:text-gray-200">
                            <div className="flex items-center">
                              <CalendarIcon className="mr-1 h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              {prescription.startDate}
                            </div>
                            {prescription.endDate !== "Ongoing" && (
                              <div className="flex items-center mt-1">
                                <Clock className="mr-1 h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                {prescription.endDate}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {prescription.refills}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prescription.status === "active" ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">Completed</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <FileText className="h-3.5 w-3.5" />
                              <span className="sr-only">View Prescription</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-3.5 w-3.5" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredPrescriptions.length === 0 && (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No prescriptions match your search criteria.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="px-6 py-8">
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="h-12 w-12 mb-2" />
                <p className="text-sm">Calendar view would be displayed here</p>
                <p className="text-xs mt-1">Showing medication schedule across months</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 
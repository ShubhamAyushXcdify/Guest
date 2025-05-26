"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, ImageIcon, FileSpreadsheet, Video, Folder, Plus } from "lucide-react"

export default function PatientFiles() {
  return (
    <div className="space-y-6">
      {/* Upload Files */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Files</h3>
          </div>
          <div className="p-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Select files or drag and drop here...</p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" className="bg-blue-500 hover:bg-blue-600 text-white">
                  Browse
                </Button>
                <Button className="theme-button text-white">Upload</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input type="text" placeholder="Search files..." className="w-full bg-white dark:bg-slate-800" />
          </div>
          <div className="flex-1 md:max-w-[200px]">
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-white dark:bg-slate-800">
                <SelectValue placeholder="File Type: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">File Type: All</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 md:max-w-[200px]">
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-white dark:bg-slate-800">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 md:max-w-[200px]">
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-white dark:bg-slate-800">
                <SelectValue placeholder="Category: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Category: All</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="lab">Lab Results</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="theme-button text-white">
            <Plus className="mr-2 h-4 w-4" /> Create New Folder
          </Button>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <FileCard name="X-ray_May12_2025.jpg" icon={<ImageIcon className="h-10 w-10 text-gray-400" />} />
          <FileCard name="Lab_Results_May12.pdf" icon={<FileText className="h-10 w-10 text-gray-400" />} />
          <FileCard name="Weight_Chart_2025.xlsx" icon={<FileSpreadsheet className="h-10 w-10 text-gray-400" />} />
          <FileCard name="Skin_Condition" icon={<Folder className="h-10 w-10 text-gray-400" />} />
          <FileCard name="Vaccination_Records.pdf" icon={<FileText className="h-10 w-10 text-gray-400" />} />
          <FileCard name="Gait_Assessment.mp4" icon={<Video className="h-10 w-10 text-gray-400" />} />
          <FileCard name="Dental_Images_Nov2024.zip" icon={<FileText className="h-10 w-10 text-gray-400" />} />
          <FileCard name="Insurance_Documents.pdf" icon={<FileText className="h-10 w-10 text-gray-400" />} />
        </div>
      </div>
    </div>
  )
}

function FileCard({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center">
      <div className="mb-2">{icon}</div>
      <p className="text-sm text-gray-900 dark:text-gray-200 text-center truncate w-full">{name}</p>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Cloud,
  File,
  FileImage,
  FileText,
  FileX,
  Folder,
  Image,
  Inbox,
  Paperclip,
  Plus,
  Search,
  UploadCloud,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PatientFiles() {
  const [searchTerm, setSearchTerm] = useState("")
  
  const files = [
    {
      id: 1,
      name: "X-Ray-20250501.jpg",
      type: "image",
      size: "2.4 MB",
      date: "May 1, 2025",
      category: "Radiology",
      uploadedBy: "Dr. Sarah Johnson",
    },
    {
      id: 2,
      name: "Bloodwork_Results_20250501.pdf",
      type: "pdf",
      size: "1.2 MB",
      date: "May 1, 2025",
      category: "Lab Results",
      uploadedBy: "Lab Technician",
    },
    {
      id: 3,
      name: "Medical_History.pdf",
      type: "pdf",
      size: "3.5 MB",
      date: "Mar 15, 2025",
      category: "Medical Records",
      uploadedBy: "Dr. Michael Chen",
    },
    {
      id: 4,
      name: "Vaccination_Certificate_Rabies.pdf",
      type: "pdf",
      size: "0.8 MB",
      date: "Mar 15, 2025",
      category: "Vaccinations",
      uploadedBy: "Office Staff",
    },
    {
      id: 5,
      name: "Ultrasound_20241110.jpg",
      type: "image",
      size: "3.1 MB",
      date: "Nov 10, 2024",
      category: "Radiology",
      uploadedBy: "Dr. Sarah Johnson",
    },
  ]

  const filteredFiles = files.filter((file) => {
    const matchesSearch = searchTerm === "" || 
                          file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Files</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag and drop files or click to browse. Supported formats: PDF, JPG, PNG, DICOM
            </p>
          </div>
          <div>
            <Button className="theme-button text-white">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white text-center">Medical Records</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">3 files</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-2">
              <FileImage className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white text-center">Radiology</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">2 files</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white text-center">Lab Results</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">1 file</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white text-center">Vaccinations</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">1 file</p>
          </CardContent>
        </Card>
      </div>

      {/* All Files */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Files</h3>
            <Button variant="ghost" size="sm">
              <Plus className="mr-1 h-4 w-4" /> New Folder
            </Button>
          </div>
          
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="relative">
              <Label htmlFor="search-files" className="sr-only">Search</Label>
              <Input
                id="search-files"
                placeholder="Search files..."
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
          </div>
          
          <div className="overflow-x-auto">
            {filteredFiles.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Uploaded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredFiles.map((file) => (
                    <tr key={file.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {file.type === 'pdf' ? (
                            <FileText className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" />
                          ) : file.type === 'image' ? (
                            <FileImage className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
                          ) : (
                            <File className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-3" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {file.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {file.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {file.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {file.uploadedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="h-8 px-3">
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-3">
                            Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center">
                <div className="h-16 w-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <Inbox className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No files found</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? `No files match "${searchTerm}"` : "Upload files to get started"}
                </p>
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
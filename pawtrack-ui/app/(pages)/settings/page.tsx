"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Users, Bell, Shield, Globe, Palette, Building, Mail, Clock } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [themeMode, setThemeMode] = useState("system")
  const [accentColor, setAccentColor] = useState("purple")
  
  return (
    <>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-8 bg-gray-100 dark:bg-slate-800">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-[#1E3D3D] data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="data-[state=active]:bg-[#1E3D3D] data-[state=active]:text-white"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-[#1E3D3D] data-[state=active]:text-white"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="data-[state=active]:bg-[#1E3D3D] data-[state=active]:text-white"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="clinic" 
              className="data-[state=active]:bg-[#1E3D3D] data-[state=active]:text-white"
            >
              Clinic
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="data-[state=active]:bg-[#1E3D3D] data-[state=active]:text-white"
            >
              System
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Update your profile photo</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="w-32 h-32 mb-4">
                    <AvatarImage src="/images/vet-placeholder.jpg" alt="Profile picture" />
                    <AvatarFallback className="bg-[#D2EFEC] text-[#1E3D3D] text-xl">DV</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-3">
                    <Button variant="outline" className="theme-button-outline">Change</Button>
                    <Button variant="outline" className="text-red-600 border-red-600">Remove</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" className="mt-1" defaultValue="David" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" className="mt-1" defaultValue="Veterinarian" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" className="mt-1" defaultValue="david.vet@pawtrack.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="(123) 456-7890" className="mt-1" defaultValue="(555) 123-4567" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <Label htmlFor="title">Professional Title</Label>
                      <Input id="title" placeholder="Veterinarian" className="mt-1" defaultValue="Lead Veterinarian" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <textarea
                        id="bio"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                        placeholder="Write a short professional bio..."
                        defaultValue="Experienced veterinarian with 10+ years specializing in small animal medicine and surgery."
                      ></textarea>
                    </div>
                  </div>
                  <Button className="theme-button text-white mt-2">Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>Manage your password and security settings</CardDescription>
                  </div>
                  <Shield className="h-5 w-5 theme-text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" className="mt-1" />
                    </div>
                  </div>
                  <Button className="theme-button text-white">Change Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </div>
                  <Users className="h-5 w-5 theme-text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <div className="font-medium">SMS Authentication</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Receive authentication codes via text message</div>
                    </div>
                    <Switch id="sms-auth" />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <div className="font-medium">Authenticator App</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Use an authenticator app for verification</div>
                    </div>
                    <Switch id="app-auth" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Perform irreversible actions</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h3 className="font-medium text-red-600">Delete Account</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        This will permanently remove your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Configure how you want to receive notifications</CardDescription>
                </div>
                <Bell className="h-5 w-5 theme-text-primary" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="font-medium mb-4">System Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Appointment Reminders</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Get notified about upcoming appointments</div>
                        </div>
                        <Switch id="appointment-reminders" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Inventory Alerts</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Notify when inventory items are low</div>
                        </div>
                        <Switch id="inventory-alerts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">New Patient Registration</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Alert when a new patient is registered</div>
                        </div>
                        <Switch id="new-patient" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Notification Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Email Notifications</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</div>
                        </div>
                        <Switch id="email-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">In-App Notifications</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Show notifications within the application</div>
                        </div>
                        <Switch id="app-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">SMS Notifications</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Receive text messages for critical updates</div>
                        </div>
                        <Switch id="sms-notifications" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>Customize the look and feel of PawTrack</CardDescription>
                </div>
                <Palette className="h-5 w-5 theme-text-primary" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="theme-mode" className="block mb-2">Theme Mode</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${themeMode === 'light' ? 'theme-border bg-[#D2EFEC] dark:bg-[#1E3D3D]/20' : 'border-gray-200 dark:border-gray-700'}`}
                        onClick={() => setThemeMode('light')}
                      >
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                        </div>
                        <span className="text-sm font-medium">Light</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${themeMode === 'dark' ? 'theme-border bg-[#D2EFEC] dark:bg-[#1E3D3D]/20' : 'border-gray-200 dark:border-gray-700'}`}
                        onClick={() => setThemeMode('dark')}
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-100"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                        </div>
                        <span className="text-sm font-medium">Dark</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${themeMode === 'system' ? 'theme-border bg-[#D2EFEC] dark:bg-[#1E3D3D]/20' : 'border-gray-200 dark:border-gray-700'}`}
                        onClick={() => setThemeMode('system')}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-white to-gray-900 border border-gray-200 flex items-center justify-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>
                        </div>
                        <span className="text-sm font-medium">System</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent-color" className="block mb-2">Accent Color</Label>
                    <div className="grid grid-cols-5 gap-4">
                      {['purple', 'blue', 'green', 'orange', 'pink'].map((color) => (
                        <div 
                          key={color}
                          className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${accentColor === color ? 'theme-button-outline bg-[#D2EFEC] dark:bg-[#1E3D3D]/20' : 'border-gray-200 dark:border-gray-700'}`}
                          onClick={() => setAccentColor(color)}
                        >
                          <div className={`w-8 h-8 rounded-full bg-${color}-600 mb-2`} />
                          <span className="text-sm font-medium capitalize">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Compact Mode</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Use more compact layout to see more data at once</p>
                    </div>
                    <Switch id="compact-mode" />
                  </div>

                  <Button className="theme-button text-white">Save Appearance Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinic Tab */}
          <TabsContent value="clinic">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Clinic Settings</CardTitle>
                  <CardDescription>Manage your clinic information and preferences</CardDescription>
                </div>
                <Building className="h-5 w-5 theme-text-primary" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <Input id="clinic-name" className="mt-1" defaultValue="PawTrack Veterinary Clinic" />
                  </div>
                  <div>
                    <Label htmlFor="clinic-email">Email Address</Label>
                    <Input id="clinic-email" type="email" className="mt-1" defaultValue="contact@pawtrack-vet.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="clinic-phone">Phone Number</Label>
                    <Input id="clinic-phone" className="mt-1" defaultValue="(555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="clinic-website">Website</Label>
                    <Input id="clinic-website" className="mt-1" defaultValue="https://pawtrack-vet.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <Label htmlFor="clinic-address">Address</Label>
                    <Input id="clinic-address" className="mt-1" defaultValue="123 Veterinary Way" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label htmlFor="clinic-city">City</Label>
                    <Input id="clinic-city" className="mt-1" defaultValue="Pawville" />
                  </div>
                  <div>
                    <Label htmlFor="clinic-state">State/Province</Label>
                    <Input id="clinic-state" className="mt-1" defaultValue="California" />
                  </div>
                  <div>
                    <Label htmlFor="clinic-zip">ZIP/Postal Code</Label>
                    <Input id="clinic-zip" className="mt-1" defaultValue="90210" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <Label htmlFor="clinic-timezone">Timezone</Label>
                    <Select defaultValue="america-los_angeles">
                      <SelectTrigger id="clinic-timezone" className="mt-1">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america-los_angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="america-denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="america-chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="america-new_york">Eastern Time (ET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="theme-button text-white">Save Clinic Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>System Preferences</CardTitle>
                    <CardDescription>Configure application behavior</CardDescription>
                  </div>
                  <Globe className="h-5 w-5 theme-text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Language</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
                      </div>
                      <Select defaultValue="en">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Date Format</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Choose how dates are displayed</p>
                      </div>
                      <Select defaultValue="mm-dd-yyyy">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY/MM/DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Time Format</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred time format</p>
                      </div>
                      <Select defaultValue="12h">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Privacy & Data</CardTitle>
                    <CardDescription>Manage your data and privacy preferences</CardDescription>
                  </div>
                  <Shield className="h-5 w-5 theme-text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Usage Analytics</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Allow us to collect anonymous usage data</p>
                      </div>
                      <Switch id="analytics" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Cookie Preferences</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage cookies used on this application</p>
                      </div>
                      <Button variant="outline" className="theme-button-outline">
                        Manage Cookies
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Data Export</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Download all your data</p>
                      </div>
                      <Button variant="outline" className="theme-button-outline">
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>View information about your PawTrack installation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium">Version</span>
                      <span className="text-gray-500 dark:text-gray-400">1.2.0</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium">Last Updated</span>
                      <span className="text-gray-500 dark:text-gray-400">June 15, 2023</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium">Database</span>
                      <span className="text-gray-500 dark:text-gray-400">v4.5.2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">License</span>
                      <span className="text-green-500">Active</span>
                    </div>
                  </div>
                  <Button className="mt-6 theme-button text-white">Check for Updates</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
} 
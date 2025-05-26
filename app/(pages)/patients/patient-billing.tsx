"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function PatientBilling() {
  return (
    <div className="space-y-6">
      {/* Account Summary, Payment Plan, Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Summary */}
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Summary</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600 dark:text-gray-400">Owner:</p>
                <p className="text-gray-900 dark:text-white font-medium">John Smith</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600 dark:text-gray-400">Outstanding Balance:</p>
                <p className="text-red-600 dark:text-red-400 font-bold">$125.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Plan */}
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Plan</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600 dark:text-gray-400">Status:</p>
                <p className="text-gray-900 dark:text-white">No active payment plan</p>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Setup Payment Plan</Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white">Process Payment</Button>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Email Statement</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input type="text" placeholder="Search invoices..." className="w-full bg-white dark:bg-slate-800" />
          </div>
          <div className="flex-1 md:max-w-[200px]">
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-white dark:bg-slate-800">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="outstanding">Outstanding</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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
          <Button className="theme-button text-white">
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
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
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">INV-12345</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">May 12, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    Annual wellness exam, vaccinations
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-medium">
                    $125.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      Outstanding
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      Pay
                    </Button>
                    <Button variant="outline" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      Email
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">INV-12211</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">Mar 15, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    Heartworm test, flea/tick preventatives
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-medium">
                    $85.50
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm" disabled className="bg-gray-100 text-gray-400">
                      Pay
                    </Button>
                    <Button variant="outline" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      Email
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">INV-11984</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">Jan 05, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    Skin infection treatment
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-medium">
                    $110.25
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm" disabled className="bg-gray-100 text-gray-400">
                      Pay
                    </Button>
                    <Button variant="outline" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      Email
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

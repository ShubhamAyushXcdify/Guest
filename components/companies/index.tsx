'use client'
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Company } from "@/queries/companies/get-company";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import CompaniesScreen from "./companies-screen";
import NewCompany from "./new-company";
import CompanyDetails from "./company-details";

export default function CompaniesPage() {
  const [openNew, setOpenNew] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleEditCompany = (company: Company | null) => {
    setSelectedCompany(company);
    setOpenNew(!company);
    setOpenDetails(!!company);
  };

  return (
    <>
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent mb-4">
            Companies
          </h1>
        </div>
        <Button
          className="theme-button text-white"
          onClick={() => handleEditCompany(null)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Company
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
        <CompaniesScreen onEditCompany={handleEditCompany} />
      </div>

      {/* Add Company Sheet */}
      <Sheet open={openNew} onOpenChange={setOpenNew}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[62%] overflow-auto">
          <SheetHeader>
            <SheetTitle>New Company</SheetTitle>
          </SheetHeader>
          <NewCompany onSuccess={() => setOpenNew(false)} />
        </SheetContent>
      </Sheet>

      {/* Edit Company Sheet */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[62%] overflow-auto">
          <SheetHeader>
            <SheetTitle>Edit Company</SheetTitle>
          </SheetHeader>
          {selectedCompany && (
            <CompanyDetails
              companyId={selectedCompany.id}
              onSuccess={() => setOpenDetails(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

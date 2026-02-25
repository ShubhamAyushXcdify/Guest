"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Company } from '@/queries/companies/get-company';
import { getCompanySubdomain } from '@/utils/subdomain';
import { useGetCompanyBySubdomain } from '@/queries/companies';


interface CompanyContextType {
  company: Company | null;
  isLoading: boolean;
  error: Error | null;
  subdomain: string;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [subdomain] = useState(() => getCompanySubdomain());
  const { data: company, isLoading, error } = useGetCompanyBySubdomain(subdomain);

  const value: CompanyContextType = {
    company: company || null,
    isLoading,
    error: error || null,
    subdomain,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
} 
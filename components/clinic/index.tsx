'use client'
import React, { useMemo, useState } from "react";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useForm } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import { useGetClinic } from "@/queries/clinic/get-clinic";

// Clinic type based on provided schema
export type Clinic = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  licenseNumber: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: string;
  createdAt: string;
  updatedAt: string;
};

type ClinicFormValues = Omit<Clinic, "id" | "createdAt" | "updatedAt">;

const columns: ColumnDef<Clinic>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "state", header: "State" },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "subscriptionStatus", header: "Subscription", cell: ({ getValue }) => <Badge>{getValue() as string}</Badge> },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex gap-2 justify-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Edit Clinic</SheetTitle>
            </SheetHeader>
            {/* Update form here */}
            <ClinicForm defaultValues={row.original} onSubmit={() => {}} />
          </SheetContent>
        </Sheet>
      </div>
    ),
    meta: { className: "text-center" },
  },
];

function ClinicForm({ defaultValues, onSubmit }: { defaultValues?: Partial<ClinicFormValues>, onSubmit: (values: ClinicFormValues) => void }) {
  const form = useForm<ClinicFormValues>({ defaultValues });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="addressLine1" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 1</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="addressLine2" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 2</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="city" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="state" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>State</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="postalCode" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Postal Code</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="country" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="phone" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="email" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input {...field} type="email" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="website" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Website</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="taxId" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Tax ID</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="licenseNumber" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>License Number</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="subscriptionStatus" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Subscription Status</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="subscriptionExpiresAt" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Subscription Expires At</FormLabel>
            <FormControl><Input {...field} type="datetime-local" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <SheetFooter>
          <Button type="submit">Save</Button>
        </SheetFooter>
      </form>
    </Form>
  );
}

export default function Clinic() {
  // For now, use empty array for clinics
  const { data: clinics, isLoading, isError } = useGetClinic();
  const [openNew, setOpenNew] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clinics</h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button onClick={() => setOpenNew(true)}><Plus className="mr-2 h-4 w-4" />Add Clinic</Button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Clinic</SheetTitle>
            </SheetHeader>
            <ClinicForm onSubmit={() => { setOpenNew(false); }} />
          </SheetContent>
        </Sheet>
      </div>
      <DataTable
        columns={columns}
        data={clinics}
        searchColumn="name"
        searchPlaceholder="Search clinics..."
        page={1}
        pageSize={10}
        totalPages={1}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    </div>
  );
}   
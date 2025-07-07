'use client'

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { X, Filter, Search } from "lucide-react";
import { ProductFilters } from "@/queries/products/get-products";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onClearFilters: () => void;
}

const PRODUCT_TYPES = [
  { value: "medication", label: "Medication" },
  { value: "vaccine", label: "Vaccine" },
  { value: "supply", label: "Supply" },
  { value: "food", label: "Food" },
  { value: "supplement", label: "Supplement" }
];

const DOSAGE_FORMS = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "liquid", label: "Liquid" },
  { value: "injection", label: "Injection" },
  { value: "topical", label: "Topical" },
  { value: "inhalant", label: "Inhalant" },
  { value: "powder", label: "Powder" },
  { value: "cream", label: "Cream" },
  { value: "ointment", label: "Ointment" },
  { value: "drops", label: "Drops" }
];

const UNITS_OF_MEASURE = [
  { value: "mg", label: "mg" },
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "l", label: "L" },
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "unit", label: "Unit" },
  { value: "piece", label: "Piece" },
  { value: "box", label: "Box" },
  { value: "bottle", label: "Bottle" }
];

const CONTROLLED_SUBSTANCE_SCHEDULES = [
  { value: "I", label: "Schedule I" },
  { value: "II", label: "Schedule II" },
  { value: "III", label: "Schedule III" },
  { value: "IV", label: "Schedule IV" },
  { value: "V", label: "Schedule V" }
];

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "created_at", label: "Created Date" },
  { value: "updated_at", label: "Updated Date" },
  { value: "product_number", label: "Product Number" },
  { value: "category", label: "Category" },
  { value: "product_type", label: "Product Type" }
];

export function ProductFiltersComponent({ filters, onFiltersChange, onClearFilters }: ProductFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters: ProductFilters = {
      pageNumber: 1,
      pageSize: filters.pageSize || 10
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
    setIsFilterOpen(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'pageNumber' && key !== 'pageSize' && value !== undefined && value !== null && value !== '') {
        count++;
      }
    });
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search products by name, generic name, product number, or NDC..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Product Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="Enter category..."
                    value={localFilters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  />
                </div>

                {/* Product Type */}
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select
                    value={localFilters.productType || 'all'}
                    onValueChange={(value) => handleFilterChange('productType', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All product types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All product types</SelectItem>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dosage Form */}
                <div className="space-y-2">
                  <Label>Dosage Form</Label>
                  <Select
                    value={localFilters.dosageForm || 'all'}
                    onValueChange={(value) => handleFilterChange('dosageForm', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All dosage forms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All dosage forms</SelectItem>
                      {DOSAGE_FORMS.map((form) => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit of Measure */}
                <div className="space-y-2">
                  <Label>Unit of Measure</Label>
                  <Select
                    value={localFilters.unitOfMeasure || 'all'}
                    onValueChange={(value) => handleFilterChange('unitOfMeasure', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All units</SelectItem>
                      {UNITS_OF_MEASURE.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Requires Prescription */}
                <div className="space-y-2">
                  <Label>Prescription Required</Label>
                  <Select
                    value={localFilters.requiresPrescription?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('requiresPrescription', value === 'all' ? undefined : value === 'true' ? true : value === 'false' ? false : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Controlled Substance Schedule */}
                <div className="space-y-2">
                  <Label>Controlled Substance Schedule</Label>
                  <Select
                    value={localFilters.controlledSubstanceSchedule || 'all'}
                    onValueChange={(value) => handleFilterChange('controlledSubstanceSchedule', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All schedules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All schedules</SelectItem>
                      {CONTROLLED_SUBSTANCE_SCHEDULES.map((schedule) => (
                        <SelectItem key={schedule.value} value={schedule.value}>
                          {schedule.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={localFilters.isActive?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('isActive', value === 'all' ? undefined : value === 'true' ? true : value === 'false' ? false : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={localFilters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={localFilters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                {/* Low Stock */}
                <div className="space-y-2">
                  <Label>Stock Level</Label>
                  <Select
                    value={localFilters.lowStock?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('lowStock', value === 'all' ? undefined : value === 'true' ? true : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All stock levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All stock levels</SelectItem>
                      <SelectItem value="true">Low stock only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Created Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !localFilters.createdFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.createdFrom ? format(new Date(localFilters.createdFrom), "PPP") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={localFilters.createdFrom ? new Date(localFilters.createdFrom) : undefined}
                          onSelect={(date) => handleFilterChange('createdFrom', date?.toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !localFilters.createdTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.createdTo ? format(new Date(localFilters.createdTo), "PPP") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={localFilters.createdTo ? new Date(localFilters.createdTo) : undefined}
                          onSelect={(date) => handleFilterChange('createdTo', date?.toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={localFilters.sortBy || 'all'}
                      onValueChange={(value) => handleFilterChange('sortBy', value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Default</SelectItem>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={localFilters.sortOrder || 'all'}
                      onValueChange={(value) => handleFilterChange('sortOrder', value === 'all' ? undefined : value as 'asc' | 'desc')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Order</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (key !== 'pageNumber' && key !== 'pageSize' && value !== undefined && value !== null && value !== '') {
              return (
                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters[key as keyof ProductFilters];
                      onFiltersChange(newFilters);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
} 
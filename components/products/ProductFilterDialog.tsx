'use client'
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter, X } from "lucide-react";
import { useFilter } from "./hooks/useFilter";

const PRODUCT_TYPES = [{name: "medication", value: "medication"}, {name: "vaccine", value: "vaccine"}, {name: "supply", value: "supply"}, {name: "food", value: "food"}, {name: "supplement", value: "supplement"}];
const PRODUCT_CATEGORIES = [{name: "antibiotics", value: "antibiotics"}, {name: "pain_management", value: "pain_management"}, {name: "vaccines", value: "vaccines"}, {name: "supplements", value: "supplements"}, {name: "medical_supplies", value: "medical_supplies"}, {name: "equipment", value: "equipment"}, {name: "food", value: "food"}, {name: "other", value: "other"}];


interface ProductFilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductFilterDialog({ isOpen, onOpenChange }: ProductFilterDialogProps) {
  const { searchParam, setSearchParam } = useFilter();
  
  // Local state for form values
  const [nameSearch, setNameSearch] = useState(searchParam.searchByname || "");
  const [category, setCategory] = useState(searchParam.category || "");
  const [productType, setProductType] = useState(searchParam.productType || "");
  const [isApplying, setIsApplying] = useState(false);

  // Update local state when URL params change
  useEffect(() => {
    setNameSearch(searchParam.searchByname || "");
    setCategory(searchParam.category || "");
    setProductType(searchParam.productType || "");
  }, [searchParam]);

  const handleApplyFilters = async () => {
    setIsApplying(true);
    try {
      setSearchParam({
        searchByname: nameSearch || null,
        category: category || null,
        productType: productType || null,
      });
      onOpenChange(false);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClearFilters = () => {
    setNameSearch("");
    setCategory("");
    setProductType("");
    setSearchParam({
      searchByname: null,
      category: null,
      productType: null,
    });
  };

  const hasActiveFilters = searchParam.searchByname || searchParam.category || searchParam.productType;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Products
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Name Search */}
          <div className="space-y-2">
            <Label htmlFor="name-search">Product Name</Label>
            <Input
              id="name-search"
              placeholder="Search by product name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="product-type">Product Type</Label>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Filters:</Label>
              <div className="flex flex-wrap gap-2">
                {searchParam.searchByname && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                    <span>Name: {searchParam.searchByname}</span>
                    <button
                      onClick={() => {
                        setNameSearch("");
                        setSearchParam({ ...searchParam, searchByname: null });
                      }}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {searchParam.category && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                    <span>Category: {searchParam.category.replace(/_/g, " ")}</span>
                    <button
                      onClick={() => {
                        setCategory("");
                        setSearchParam({ ...searchParam, category: null });
                      }}
                      className="ml-1 hover:text-green-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {searchParam.productType && (
                  <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
                    <span>Type: {searchParam.productType}</span>
                    <button
                      onClick={() => {
                        setProductType("");
                        setSearchParam({ ...searchParam, productType: null });
                      }}
                      className="ml-1 hover:text-purple-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApplyFilters} disabled={isApplying}>
              {isApplying ? "Applying..." : "Apply Filters"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
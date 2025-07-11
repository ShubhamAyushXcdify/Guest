import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "ordered", label: "Ordered" },
  { value: "partial", label: "Partial" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

export type PurchaseOrderFilters = {
  orderNumber?: string;
  supplierId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

interface PurchaseOrderFilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PurchaseOrderFilters;
  setFilters: (filters: PurchaseOrderFilters) => void;
}

export default function PurchaseOrderFilterDialog({ isOpen, onOpenChange, filters, setFilters }: PurchaseOrderFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<PurchaseOrderFilters>(filters);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const handleApply = () => {
    setIsApplying(true);
    setFilters(localFilters);
    setIsApplying(false);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocalFilters({});
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Purchase Orders
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Order Number */}
          <div className="space-y-2">
            <Label htmlFor="order-number">Order #</Label>
            <Input
              id="order-number"
              placeholder="Search by order number..."
              value={localFilters.orderNumber || ""}
              onChange={e => setLocalFilters(f => ({ ...f, orderNumber: e.target.value }))}
            />
          </div>
          {/* Supplier ID */}
          <div className="space-y-2">
            <Label htmlFor="supplier-id">Supplier ID</Label>
            <Input
              id="supplier-id"
              placeholder="Supplier ID..."
              value={localFilters.supplierId || ""}
              onChange={e => setLocalFilters(f => ({ ...f, supplierId: e.target.value }))}
            />
          </div>
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status || undefined}
              onValueChange={val => setLocalFilters(f => ({ ...f, status: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Date Range */}
          <div className="flex gap-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={localFilters.dateFrom || ""}
                onChange={e => setLocalFilters(f => ({ ...f, dateFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={localFilters.dateTo || ""}
                onChange={e => setLocalFilters(f => ({ ...f, dateTo: e.target.value }))}
              />
            </div>
          </div>
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Filters:</Label>
              <div className="flex flex-wrap gap-2">
                {filters.orderNumber && (
                  <Badge variant="secondary" className="text-xs">Order #: {filters.orderNumber}</Badge>
                )}
                {filters.supplierId && (
                  <Badge variant="secondary" className="text-xs">Supplier: {filters.supplierId}</Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="text-xs">Status: {filters.status}</Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary" className="text-xs">From: {filters.dateFrom}</Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary" className="text-xs">To: {filters.dateTo}</Badge>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleClear} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={isApplying}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
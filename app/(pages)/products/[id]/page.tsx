'use client';

import { useParams } from 'next/navigation';
import { useGetProductById } from '@/queries/products/get-product-by-id';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: product, isLoading, isError } = useGetProductById(productId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">Product Details</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/products/${productId}/edit`)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Product
        </Button>
      </div>

      {/* Product Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product Number</label>
                <p className="text-sm">{product.productNumber || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Brand Name</label>
                <p className="text-sm">{product.brandName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Generic Name</label>
                <p className="text-sm">{product.genericName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="text-sm">{product.category || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                <p className="text-sm">{product.productType || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Price</label>
                <p className="text-sm">${product.price || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">NDC Number</label>
                <p className="text-sm">{product.ndcNumber || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dosage Form</label>
                <p className="text-sm">{product.dosageForm || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit of Measure</label>
                <p className="text-sm">{product.unitOfMeasure || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reorder Threshold</label>
                <p className="text-sm">{product.reorderThreshold || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Controlled Substance Schedule</label>
                <p className="text-sm">{product.controlledSubstanceSchedule || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Storage Requirements</label>
                <p className="text-sm">{product.storageRequirements || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Requires Prescription</span>
              <Badge variant={product.requiresPrescription ? "default" : "outline"}>
                {product.requiresPrescription ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={product.isActive ? "default" : "destructive"}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
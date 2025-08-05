'use client';

import React from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { useGetProductQrCode } from '@/queries/products/get-product-qr-code';
import { useGetProductBarcode } from '@/queries/products/get-product-barcode';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from '../ui/use-toast';

interface ProductCodesProps {
  productId: string;
  productNumber: string;
  productName: string;
}

export default function ProductCodes({ productId, productNumber, productName }: ProductCodesProps) {
  const { data: qrCodeData, isLoading: qrLoading, error: qrError } = useGetProductQrCode(productId);
  const { data: barcodeData, isLoading: barcodeLoading, error: barcodeError } = useGetProductBarcode(productId);

  const handleDownloadQR = () => {
    try {
      const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `qr-code-${productNumber}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast({
          title: "Success",
          description: "QR code downloaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const handleDownloadBarcode = () => {
    try {
      const canvas = document.getElementById('barcode-canvas') as HTMLCanvasElement;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `barcode-${productNumber}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast({
          title: "Success",
          description: "Barcode downloaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download barcode",
        variant: "destructive",
      });
    }
  };

  const handlePrintCodes = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrCanvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
      const barcodeCanvas = document.getElementById('barcode-canvas') as HTMLCanvasElement;
      
      if (qrCanvas && barcodeCanvas) {
        const qrImage = qrCanvas.toDataURL();
        const barcodeImage = barcodeCanvas.toDataURL();
        
        printWindow.document.write(`
          <html>
            <head>
              <title>Product Codes - ${productName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .codes-container { display: flex; gap: 40px; justify-content: center; }
                .code-section { text-align: center; }
                .code-section h3 { margin-bottom: 10px; }
                .code-section img { border: 1px solid #ccc; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <h1 style="text-align: center; margin-bottom: 30px;">Product Codes</h1>
              <div class="codes-container">
                <div class="code-section">
                  <h3>QR Code</h3>
                  <img src="${qrImage}" alt="QR Code" />
                  <p><strong>Product:</strong> ${productName}</p>
                  <p><strong>SKU:</strong> ${productNumber}</p>
                </div>
                <div class="code-section">
                  <h3>Barcode</h3>
                  <img src="${barcodeImage}" alt="Barcode" />
                  <p><strong>Product:</strong> ${productName}</p>
                  <p><strong>SKU:</strong> ${productNumber}</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (qrLoading || barcodeLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading codes...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (qrError || barcodeError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            Error loading product codes. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Product Codes
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintCodes}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold">QR Code</h3>
            <div className="bg-white p-4 rounded-lg border">
              <QRCodeSVG
                id="qr-code-canvas"
                value={JSON.stringify(qrCodeData)}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadQR}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download QR Code
            </Button>
            <div className="text-sm text-gray-600 text-center">
              <p><strong>Product:</strong> {productName}</p>
              <p><strong>SKU:</strong> {productNumber}</p>
            </div>
          </div>

          {/* Barcode Section */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold">Barcode</h3>
            <div className="bg-white p-4 rounded-lg border">
              <Barcode
                id="barcode-canvas"
                value={productNumber}
                width={2}
                height={100}
                fontSize={14}
                margin={10}
                displayValue={true}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadBarcode}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Barcode
            </Button>
            <div className="text-sm text-gray-600 text-center">
              <p><strong>Product:</strong> {productName}</p>
              <p><strong>SKU:</strong> {productNumber}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
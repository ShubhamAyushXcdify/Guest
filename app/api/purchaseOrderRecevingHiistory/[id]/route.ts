import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export interface UpdateReceivingHistoryData {
  id: string;
  purchaseOrderId: string;
  purchaseOrderItemId: string;
  productId: string;
  clinicId: string;
  quantityReceived: number;
  batchNumber: string;
  expiryDate?: string;
  dateOfManufacture?: string;
  receivedDate?: string;
  receivedBy?: string;
  notes?: string;
  unitCost?: number;
  lotNumber?: string;
  supplierId?: string;
  quantityOnHand?: number;
  barcode?: string;
  shelf?: string;
  bin?: string;
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    const response = await fetch(
      `${apiUrl}/api/PurchaseOrderReceivingHistory/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('PurchaseOrderReceivingHistory API error:', response.status);
      return NextResponse.json(
        { message: 'Failed to fetch purchase order receiving history' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching purchase order receiving history:', error);
    return NextResponse.json(
      { message: 'Error fetching purchase order receiving history data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const body: UpdateReceivingHistoryData = await request.json();
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    const response = await fetch(
      `${apiUrl}/api/PurchaseOrderReceivingHistory/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...body,
          id: id, // Ensure the ID is included in the body
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details");
      console.error("Error response from backend:", errorText);
      throw new Error('Failed to update receiving history');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error updating purchase order receiving history:', error);
    return NextResponse.json(
      { message: 'Error updating purchase order receiving history' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    const response = await fetch(
      `${apiUrl}/api/PurchaseOrderReceivingHistory/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('PurchaseOrderReceivingHistory delete API error:', response.status);
      return NextResponse.json(
        { message: 'Failed to delete purchase order receiving history' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Purchase order receiving history deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting purchase order receiving history:', error);
    return NextResponse.json(
      { message: 'Error deleting purchase order receiving history' },
      { status: 500 }
    );
  }
}
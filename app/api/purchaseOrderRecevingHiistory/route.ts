import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(request: NextRequest) {
  try {
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const params = [
      'clinicId',
      'dateFrom',
      'dateTo',
      'supplierId',
      'productId',
      'batchNumber',
      'receivedBy',
      'purchaseOrderId',
      'purchaseOrderItemId',
      'lotNumber',
      'page',
      'pageSize'
    ];
    const query: string[] = [];
    params.forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null && value !== undefined && value !== '') {
        query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    });

    const queryString = query.length > 0 ? `?${query.join('&')}` : '';

    const response = await fetch(
      `${apiUrl}/api/PurchaseOrderReceivingHistory${queryString}`,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let token = getJwtToken(request);

    if(!token) {
      token = testToken;
    }

    const response = await fetch(
      `${apiUrl}/api/PurchaseOrderReceivingHistory`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details");
      console.error("Error response from backend:", errorText);
      throw new Error('Failed to create purchase order receiving history');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order receiving history:', error);
    return NextResponse.json(
      { message: 'Error creating purchase order receiving history' },
      { status: 500 }
    );
  }
}
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
      'pageNumber',
      'pageSize',
      'productId',
      'clinicId',
      'search',
      'lotNumber',
      'quantityOnHand',
      'quantityReserved',
      'reorderLevel',
      'reorderQuantity',
      'unitCost',
      'wholesaleCost',
      'retailPrice',
      'location',
      'unitOfMeasure',
      'unitsPerPackage',
      'batchNumber',
      'receivedFromPo',
      'poItemId'
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
      `${apiUrl}/api/Inventory${queryString}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Inventory API error:', response.status);
      throw new Error('Failed to fetch inventory from backend');
    }

    const data = await response.json();
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Error in inventory GET route:', error);
    return NextResponse.json({ message: `Error fetching inventory: ${error.message}` }, { status: 500 });
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
      `${apiUrl}/api/Inventory`,
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
      throw new Error('Failed to create inventory item');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in inventory POST route:", error);
    return NextResponse.json({ message: `Error creating inventory item: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    let token = getJwtToken(request);

    if(!token) {
      token = testToken;
    }

    const response = await fetch(
      `${apiUrl}/api/Inventory`,
      {
        method: 'PUT',
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
      throw new Error('Failed to update inventory item');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in inventory PUT route:", error);
    return NextResponse.json({ message: `Error updating inventory item: ${error.message}` }, { status: 500 });
  }
}

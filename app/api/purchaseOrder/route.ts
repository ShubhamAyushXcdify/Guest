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

    const response = await fetch(
      `${apiUrl}/api/PurchaseOrder`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('PurchaseOrder API error:', response.status);
      throw new Error('Failed to fetch purchase orders from backend');
    }

    const data = await response.json();
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Error in purchase orders GET route:', error);
    return NextResponse.json({ message: `Error fetching purchase orders: ${error.message}` }, { status: 500 });
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
      `${apiUrl}/api/PurchaseOrder`,
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
      throw new Error('Failed to create purchase order');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in purchase orders POST route:", error);
    return NextResponse.json({ message: `Error creating purchase order: ${error.message}` }, { status: 500 });
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
      `${apiUrl}/api/PurchaseOrder`,
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
      throw new Error('Failed to update purchase order');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in purchase orders PUT route:", error);
    return NextResponse.json({ message: `Error updating purchase order: ${error.message}` }, { status: 500 });
  }
}

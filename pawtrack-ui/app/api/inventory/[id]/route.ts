import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    const { id } = await params;

    const body = await request.json();

    const response = await fetch(
      `${apiUrl}/api/Inventory/${id}`,
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
      console.error('Inventory update API error:', errorText);
      throw new Error('Failed to update inventory item');
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Error in inventory update PUT route:', error);
    return NextResponse.json({ message: `Error updating inventory: ${error.message}` }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    const { id } = await params;

    const response = await fetch(
      `${apiUrl}/api/Inventory/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details");
      console.error('Inventory get API error:', errorText);
      throw new Error('Failed to fetch inventory item');
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Error in inventory get GET route:', error);
    return NextResponse.json({ message: `Error fetching inventory: ${error.message}` }, { status: 500 });
  }
}
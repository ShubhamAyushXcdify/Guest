import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("pageSize") || "10";
  const search = searchParams.get("search") || "";
  const token = getJwtToken(request);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Slot`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch slots: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our expected format
    const formattedData = {
      pageNumber: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: 1,
      totalCount: data.length,
      items: data
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json(
      { 
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 0,
        items: [],
        error: "Failed to fetch slots" 
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = getJwtToken(request);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Slot`, {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to create slot: ${response.status}`);
    }

    const newSlot = await response.json();
    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create slot" },
      { status: 500 }
    );
  }
}

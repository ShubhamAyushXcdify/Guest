import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = getJwtToken(request);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/DoctorSlot`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch doctor slots: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching doctor slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor slots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = getJwtToken(request);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/DoctorSlot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to create doctor slot: ${response.status}`);
    }

    const newDoctorSlot = await response.json();
    return NextResponse.json(newDoctorSlot, { status: 201 });
  } catch (error) {
    console.error("Error creating doctor slot:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create doctor slot" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const token = getJwtToken(request);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/DoctorSlot/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Doctor slot not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch doctor slot: ${response.status}`);
    }

    const doctorSlot = await response.json();
    return NextResponse.json(doctorSlot);
  } catch (error) {
    console.error("Error fetching doctor slot:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor slot" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const token = getJwtToken(request);

  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/DoctorSlot/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update doctor slot: ${response.status}`);
    }

    const updatedDoctorSlot = await response.json();
    return NextResponse.json(updatedDoctorSlot);
  } catch (error) {
    console.error("Error updating doctor slot:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update doctor slot" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const token = getJwtToken(request);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/DoctorSlot/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Doctor slot not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to delete doctor slot: ${response.status}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting doctor slot:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor slot" },
      { status: 500 }
    );
  }
}

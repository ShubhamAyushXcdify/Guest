import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

interface SlotParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: SlotParams) {
  const { id } = await context.params;
  const token = getJwtToken(request);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Slot/${id}`, {
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
          { error: "Slot not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch slot: ${response.status}`);
    }

    const slot = await response.json();
    return NextResponse.json(slot);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch slot" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: SlotParams) {
  const { id } = await context.params;
  const token = getJwtToken(request);
  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Slot/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update slot: ${response.status}`);
    }

    const updatedSlot = await response.json();
    return NextResponse.json(updatedSlot);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update slot" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: SlotParams) {
  const { id } = await context.params;
  const token = getJwtToken(request);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Slot/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Slot not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to delete slot: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete slot" },
      { status: 500 }
    );
  }
}

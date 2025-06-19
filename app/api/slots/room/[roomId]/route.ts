import { NextResponse } from "next/server";

import { getJwtToken, getWorkspaceId } from "@/utils/serverCookie";
import { NextRequest } from "next/server";
interface SlotParams {
  params: {
    roomId: string;
  };
}

export async function GET(request: NextRequest, { params }: SlotParams) {
  const { roomId } = params;
  const token = getJwtToken(request);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Slot/room/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch slots for room: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform response to match expected format if it's an array
    if (Array.isArray(data)) {
      const transformedData = {
        pageNumber: 1,
        pageSize: data.length,
        totalPages: 1,
        totalCount: data.length,
        items: data.map(slot => ({
          ...slot,
          name: slot.name || `${slot.startTime} - ${slot.endTime}`
        }))
      };
      return NextResponse.json(transformedData);
    }
    
    // If it's already in the expected format, return as is
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch slots for room" },
      { status: 500 }
    );
  }
} 
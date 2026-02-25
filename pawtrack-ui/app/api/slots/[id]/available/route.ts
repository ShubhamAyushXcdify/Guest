import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

interface SlotAvailabilityParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: NextRequest, context: SlotAvailabilityParams) {
  const { id } = await context.params;
  const { isAvailable } = await req.json();
  const token = getJwtToken(req);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Slot/${id}/available`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isAvailable }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update slot: ${response.status}`);
    }

    const updatedSlot = await response.json();
    return NextResponse.json(updatedSlot);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update slot availability' },
      { status: 500 }
    );
  }
}

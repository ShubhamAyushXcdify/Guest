import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  try {
    const token = getJwtToken(request);

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestBody = await request.json();

    // Validate the request body format
    if (!requestBody.clinicId || !Array.isArray(requestBody.slotIds)) {
      return NextResponse.json(
        { message: 'Invalid request format. Expected { clinicId: string, slotIds: string[] }' },
        { status: 400 }
      );
    }

    // Call the backend API to update user slots
    const response = await fetch(`${apiUrl}/api/User/${id}/slots`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody), // Forward the entire request body
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to update user slots' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'User slots updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user slots:', error);
    return NextResponse.json(
      { message: 'Error updating user slots' },
      { status: 500 }
    );
  }
}
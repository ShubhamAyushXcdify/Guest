import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function GET(
  request: NextRequest,
  ctx: { params: { id: string } }
) {
  const { id } = ctx.params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  
  try {
    const token = getJwtToken(request);

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build the URL with query parameters if date is provided
    let url = `${apiUrl}/api/User/${id}/available-slots`;
    if (date) {
      url += `?date=${date}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Error fetching available slots:', response.status);
      return NextResponse.json(
        { message: 'Failed to fetch available slots' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { message: `Error fetching available slots: ${error.message}` },
      { status: 500 }
    );
  }
} 
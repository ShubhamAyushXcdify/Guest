import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const pageNumber = searchParams.get('pageNumber');
    const pageSize = searchParams.get('pageSize');
    const paginationRequired = searchParams.get('paginationRequired');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const token = getJwtToken(req);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const qs = new URLSearchParams();
    if (pageNumber) qs.set('pageNumber', pageNumber);
    if (pageSize) qs.set('pageSize', pageSize);
    if (paginationRequired) qs.set('paginationRequired', paginationRequired);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';

    const response = await fetch(`${apiUrl}/api/Conversation/patient/${patientId}/messages${suffix}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to load messages' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filter out system role messages (summaries) from display
    // They should not be shown in the chat UI but are used for AI context
    if (Array.isArray(data)) {
      const filteredData = data.filter((msg: any) => {
        const role = msg.role || msg.roleName || '';
        return role !== 'system';
      });
      return NextResponse.json(filteredData, { status: 200 });
    } else if (data.items && Array.isArray(data.items)) {
      const filteredItems = data.items.filter((msg: any) => {
        const role = msg.role || msg.roleName || '';
        return role !== 'system';
      });
      return NextResponse.json(
        { ...data, items: filteredItems },
        { status: 200 }
      );
    } else if (data.messages && Array.isArray(data.messages)) {
      const filteredMessages = data.messages.filter((msg: any) => {
        const role = msg.role || msg.roleName || '';
        return role !== 'system';
      });
      return NextResponse.json(
        { ...data, messages: filteredMessages },
        { status: 200 }
      );
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error loading messages' },
      { status: 500 }
    );
  }
}


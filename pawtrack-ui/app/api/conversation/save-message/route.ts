import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
  try {
    const { patientId, role, content, metadata }: {
      patientId: string;
      role: 'user' | 'assistant';
      content: string;
      metadata?: any;
    } = await req.json();

    if (!patientId || !role || !content) {
      return NextResponse.json(
        { error: 'patientId, role, and content are required' },
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

    const response = await fetch(`${apiUrl}/api/Conversation/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        patientId,
        role,
        content,
        ...(metadata && { metadata }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error saving message:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error in save-message route:', error);
    return NextResponse.json(
      { error: `Error saving message: ${error.message}` },
      { status: 500 }
    );
  }
}


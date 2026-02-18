import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

/** Extract error message from backend response (JSON message/error/title or plain text). */
async function getMessageFromBackendResponse(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = await response.json().catch(() => ({}));
      const msg = (body && typeof body === "object" && (body.message ?? body.error ?? body.title)) || "";
      if (typeof msg === "string" && msg.trim()) return msg.trim();
    }
    const text = await response.text().catch(() => "");
    if (typeof text === "string" && text.trim()) return text.trim();
  } catch {
    // ignore
  }
  return fallback;
}

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
    request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/Client/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to fetch client' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json(
            { message: 'Error fetching client data' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        const body = await request.json();
        
        // Send PUT request to /api/Client endpoint (without ID in URL)
        const response = await fetch(`${apiUrl}/api/Client/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const message = await getMessageFromBackendResponse(response, "Failed to update client");
            return NextResponse.json(
                { message },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json(
            { message: 'Error updating client data' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/Client/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to delete client' },
                { status: response.status }
            );
        }

        return NextResponse.json(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
            { message: 'Error deleting client data' },
            { status: 500 }
        );
    }
} 
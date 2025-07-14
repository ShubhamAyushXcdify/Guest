import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
    request: NextRequest,
    ctx: { params: Promise<{ visitId: string }> }
) {
    const { visitId } = await ctx.params;
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/IntakeDetail/visit/${visitId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(null, { status: 200 }); // or return empty structure
            }
            return NextResponse.json(
                { message: 'Failed to fetch intake detail by visit ID' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching intake detail by visit ID:', error);
        return NextResponse.json(
            { message: 'Error fetching intake detail by visit ID' },
            { status: 500 }
        );
    }
} 
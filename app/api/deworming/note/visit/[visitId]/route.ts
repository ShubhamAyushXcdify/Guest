import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
    request: NextRequest,
    ctx: { params: { visitId: string } }
) {
    const { visitId } = ctx.params;
    try {
        let token = getJwtToken(request);
        if (!token) {
            token = testToken;
        }
        const response = await fetch(`${apiUrl}/api/DewormingVisit/note/visit/${visitId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to fetch deworming note by visitId' },
                { status: response.status }
            );
        }
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching deworming note by visitId:', error);
        return NextResponse.json(
            { message: 'Error fetching deworming note by visitId' },
            { status: 500 }
        );
    }
} 
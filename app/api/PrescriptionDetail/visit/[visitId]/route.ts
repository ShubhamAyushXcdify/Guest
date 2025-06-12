import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
    request: NextRequest,
    { params }: { params: { visitId: string } }
) {
    try {
        let token = getJwtToken(request);
        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/PrescriptionDetail/visit/${params.visitId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || 'Failed to fetch prescription detail by visit ID' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching prescription detail by visit ID:', error);
        return NextResponse.json(
            { message: 'Error fetching prescription detail by visit ID' },
            { status: 500 }
        );
    }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';
import { SAMPLE_CLIENTS } from '../route';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/Client/${params.id}`, {
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
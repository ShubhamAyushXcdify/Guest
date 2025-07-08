import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

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

        const response = await fetch(`${apiUrl}/api/ClientRegistration/${params.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to fetch client registration' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching client registration:', error);
        return NextResponse.json(
            { message: 'Error fetching client registration data' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/ClientRegistration/${params.id}`,
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
                { message: 'Failed to delete client registration' },
                { status: response.status }
            );
        }

        return NextResponse.json(null, { status: 200 });
    } catch (error) {
        console.error('Error deleting client registration:', error);
        return NextResponse.json(
            { message: 'Error deleting client registration data' },
            { status: 500 }
        );
    }
}

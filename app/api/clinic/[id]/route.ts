import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = getJwtToken(request);

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await fetch(`${apiUrl}/api/Clinic/${params.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to fetch clinic' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching clinic:', error);
        return NextResponse.json(
            { message: 'Error fetching clinic data' },
            { status: 500 }
        );
    }
}


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = getJwtToken(request);

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await fetch(
            `${apiUrl}/api/Clinic/${params.id}`,
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
                { message: 'Failed to delete clinic' },
                { status: response.status }
            );
        }

        return NextResponse.json(
            { message: 'Clinic deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting clinic:', error);
        return NextResponse.json(
            { message: 'Error deleting clinic' },
            { status: 500 }
        );
    }
}

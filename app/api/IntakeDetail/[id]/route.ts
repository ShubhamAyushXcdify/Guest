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

        const response = await fetch(`${apiUrl}/api/IntakeDetail/${params.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to fetch intake detail' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching intake detail:', error);
        return NextResponse.json(
            { message: 'Error fetching intake detail data' },
            { status: 500 }
        );
    }
}

export async function PUT(
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

        // Clone the request to avoid consuming it
        const clonedRequest = request.clone();
        
        // Get FormData from the request
        const formData = await clonedRequest.formData();
        
        // Make sure the ID is included in the FormData
        formData.append('id', params.id);
        
        const response = await fetch(`${apiUrl}/api/IntakeDetail/${params.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type, it will be set automatically with the boundary
            },
            body: formData,
        });

        if (response.status === 401) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return NextResponse.json(
                { message: errorData?.message || 'Failed to update intake detail' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error updating intake detail:', error);
        return NextResponse.json(
            { message: 'Error updating intake detail' },
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

        const response = await fetch(`${apiUrl}/api/IntakeDetail/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return NextResponse.json(
                { message: errorData?.message || 'Failed to delete intake detail' },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'Intake detail deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting intake detail:', error);
        return NextResponse.json(
            { message: 'Error deleting intake detail' },
            { status: 500 }
        );
    }
} 
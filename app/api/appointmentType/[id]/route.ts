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

        const response = await fetch(`${apiUrl}/api/AppointmentType/${params.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to fetch appointment type' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching appointment type:', error);
        return NextResponse.json(
            { message: 'Error fetching appointment type data' },
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

        const body = await request.json();
        const response = await fetch(`${apiUrl}/api/AppointmentType/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to update appointment type: ${response.status}`);
        }

        // Check if there's content before trying to parse JSON
        const contentType = response.headers.get("content-type");
        let data = null;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json().catch(() => null);
        }

        return NextResponse.json({
            message: 'Appointment type updated successfully',
            data: data || body
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating appointment type:', error);
        return NextResponse.json(
            { message: 'Error updating appointment type', error: error instanceof Error ? error.message : 'Unknown error' },
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

        const response = await fetch(`${apiUrl}/api/AppointmentType/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete appointment type: ${response.status}`);
        }

        return NextResponse.json({
            message: 'Appointment type deleted successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting appointment type:', error);
        return NextResponse.json(
            { message: 'Error deleting appointment type', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

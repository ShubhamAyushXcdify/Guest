import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

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
        const response = await fetch(`${apiUrl}/api/DewormingVisit/note/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to fetch deworming note' },
                { status: response.status }
            );
        }
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching deworming note:', error);
        return NextResponse.json(
            { message: 'Error fetching deworming note data' },
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
        const token = getJwtToken(request);
        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }
        const body = await request.json();
        const response = await fetch(`${apiUrl}/api/DewormingVisit/note/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        if (response.status === 401) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return NextResponse.json(
                { message: errorData?.message || 'Failed to update deworming note' },
                { status: response.status }
            );
        }
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error updating deworming note:', error);
        return NextResponse.json(
            { message: 'Error updating deworming note' },
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
        const token = getJwtToken(request);
        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }
        const response = await fetch(`${apiUrl}/api/DewormingVisit/note/${id}`, {
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
                { message: errorData?.message || 'Failed to delete deworming note' },
                { status: response.status }
            );
        }
        return NextResponse.json({ message: 'Deworming note deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting deworming note:', error);
        return NextResponse.json(
            { message: 'Error deleting deworming note' },
            { status: 500 }
        );
    }
} 
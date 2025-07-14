import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';
import { parseAsNumberLiteral } from 'nuqs';

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

        const response = await fetch(`${apiUrl}/api/PrescriptionDetail/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || 'Failed to fetch prescription detail' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching prescription detail:', error);
        return NextResponse.json(
            { message: 'Error fetching prescription detail data' },
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
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const response = await fetch(`${apiUrl}/api/PrescriptionDetail/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || 'Failed to update prescription detail' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error updating prescription detail:', error);
        return NextResponse.json(
            { message: 'Error updating prescription detail' },
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
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${apiUrl}/api/PrescriptionDetail/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || 'Failed to delete prescription detail' },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'Prescription detail deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting prescription detail:', error);
        return NextResponse.json(
            { message: 'Error deleting prescription detail' },
            { status: 500 }
        );
    }
} 
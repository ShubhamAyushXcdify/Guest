import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

interface ErrorResponse {
    message?: string;
    [key: string]: any;
}

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

        const response = await fetch(`${apiUrl}/api/ProcedureDocumentDetails/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || 'Failed to fetch procedure document details' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error fetching procedure document details' },
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
        const body = await request.json();
        let token = getJwtToken(request);
        if (!token) {
            token = testToken;
        }
        
        const response = await fetch(`${apiUrl}/api/ProcedureDocumentDetails/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            
            let errorData: ErrorResponse = {};
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                // Failed to parse error response
            }
            
            return NextResponse.json(
                { 
                    message: errorData.message || 'Failed to update procedure document details',
                    status: response.status,
                    details: errorText
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { 
                message: 'Error updating procedure document details',
                error: error instanceof Error ? error.message : String(error)
            },
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
        let token = getJwtToken(request);
        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/ProcedureDocumentDetails/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || 'Failed to delete procedure document details' },
                { status: response.status }
            );
        }

        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error deleting procedure document details' },
            { status: 500 }
        );
    }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
    request: NextRequest,
    ctx: { params: { visitId: string; procedureId: string } }
) {
    const { visitId, procedureId } = ctx.params;
    try {
        let token = getJwtToken(request);
        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/ProcedureDocumentDetails/visit/${visitId}/procedure/${procedureId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                // No data found yet – return null or an empty object
                return NextResponse.json(null, { status: 200 });
            }
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || 'Failed to fetch procedure document details' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching procedure document details:', error);
        return NextResponse.json(
            { message: 'Error fetching procedure document details' },
            { status: 500 }
        );
    }
} 
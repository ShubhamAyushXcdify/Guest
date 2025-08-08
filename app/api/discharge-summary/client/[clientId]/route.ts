import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
    request: NextRequest,
    ctx: { params: Promise<{ clientId: string }> }
) {
    const { clientId } = await ctx.params;
    const { searchParams } = new URL(request.url);
    
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        // Get optional query parameters
        const fromDate = searchParams.get('fromDate') || '';
        const toDate = searchParams.get('toDate') || '';

        // Build the URL with query parameters
        let url = `${apiUrl}/api/DischargeSummary/client/${clientId}`;
        const queryParams = new URLSearchParams();
        
        if (fromDate) {
            queryParams.append('fromDate', fromDate);
        }
        
        if (toDate) {
            queryParams.append('toDate', toDate);
        }
        
        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to fetch discharge summaries' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching discharge summaries:', error);
        return NextResponse.json(
            { message: 'Error fetching discharge summary data' },
            { status: 500 }
        );
    }
}

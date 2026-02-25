import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

// GET API Route for discharge summary
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ visitId: string }> }
) {
    try {
        const { visitId } = await params;
        
        if (!visitId) {
            return NextResponse.json(
                { message: 'Visit ID is required' },
                { status: 400 }
            );
        }

        const token = getJwtToken(request);

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Construct the API endpoint URL
        const apiEndpoint = `${apiUrl}/api/DischargeSummary/deworming/${visitId}`;

        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (response.status === 404) {
            return NextResponse.json(
                { message: 'Discharge summary not found' },
                { status: 404 }
            );
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Fetch discharge summary error:', errorData);
            return NextResponse.json(
                { message: errorData?.message || 'Failed to fetch discharge summary' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ data: data }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching discharge summary:', error);
        return NextResponse.json(
            { message: `Error fetching discharge summary: ${error.message}` },
            { status: 500 }
        );
    }
}

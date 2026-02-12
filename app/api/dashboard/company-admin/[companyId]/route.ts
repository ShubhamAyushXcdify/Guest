import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ companyId: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const { companyId } = await params;
        const baseApiUrl = `${apiUrl}/api/Dashboard/company-admin`;
        const formattedParams = new URLSearchParams();

        // Add companyId parameter from URL path
        formattedParams.set('companyId', companyId);

        // Add date parameters if present
        if (searchParams.has('fromDate')) {
            formattedParams.set('fromDate', searchParams.get('fromDate')!);
        }
        if (searchParams.has('toDate')) {
            formattedParams.set('toDate', searchParams.get('toDate')!);
        }
        // Backend should use this to return all-time numberOfVeterinarians/numberOfPatients (not filtered by date)
        if (searchParams.get('useAllTimeCountsForClinicDetails') === 'true') {
            formattedParams.set('useAllTimeCountsForClinicDetails', 'true');
        }

        // Copy any other parameters
        searchParams.forEach((value, key) => {
            if (!formattedParams.has(key)) {
                formattedParams.set(key, value);
            }
        });

        const queryString = formattedParams.toString();
        const apiEndpoint = queryString 
            ? `${baseApiUrl}?${queryString}` 
            : baseApiUrl;

        let token = getJwtToken(request);

        const response = await fetch(
            apiEndpoint,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard summary from backend');
        }

        const data = await response.json();
        return NextResponse.json({ data: data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching dashboard summary: ${error.message}` }, { status: 500 });
    }
} 
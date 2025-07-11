import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clinicId = searchParams.get('clinicId');
        
        if (!clinicId) {
            return NextResponse.json({ message: 'Clinic ID is required' }, { status: 400 });
        }

        const baseApiUrl = `${apiUrl}/api/Dashboard/clinic-admin`;
        const formattedParams = new URLSearchParams();

        // Add clinic ID parameter
        formattedParams.set('clinicId', clinicId);

        // Add date parameters if present
        if (searchParams.has('fromDate')) {
            formattedParams.set('fromDate', searchParams.get('fromDate')!);
        }
        if (searchParams.has('toDate')) {
            formattedParams.set('toDate', searchParams.get('toDate')!);
        }

        // Copy any other parameters
        searchParams.forEach((value, key) => {
            if (!formattedParams.has(key)) {
                formattedParams.set(key, value);
            }
        });

        const queryString = formattedParams.toString();
        const apiEndpoint = `${baseApiUrl}?${queryString}`;

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
            throw new Error('Failed to fetch clinic admin dashboard data from backend');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching clinic admin dashboard: ${error.message}` }, { status: 500 });
    }
} 
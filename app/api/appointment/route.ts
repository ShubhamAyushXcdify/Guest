import { NextResponse } from "next/server";

import { getJwtToken, getWorkspaceId } from "@/utils/serverCookie";
import { NextRequest } from "next/server";


const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

// GET API Route
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Create a completely new URL to avoid any issues with parameter formatting
        const baseApiUrl = `${apiUrl}/api/Appointment`;
        
        // Extract and format all parameters
        const formattedParams = new URLSearchParams();
        
        // Ensure pagination parameters are present
        formattedParams.set('pageNumber', searchParams.get('pageNumber') || '1');
        formattedParams.set('pageSize', searchParams.get('pageSize') || '10');
        
        // Add UUID parameters if present
        if (searchParams.has('clinicId')) {
            formattedParams.set('clinicId', searchParams.get('clinicId')!);
        }
        
        if (searchParams.has('patientId')) {
            formattedParams.set('patientId', searchParams.get('patientId')!);
        }
        
        if (searchParams.has('clientId')) {
            formattedParams.set('clientId', searchParams.get('clientId')!);
        }
        
        if (searchParams.has('veterinarianId')) {
            formattedParams.set('veterinarianId', searchParams.get('veterinarianId')!);
        }
        
        if (searchParams.has('roomId')) {
            formattedParams.set('roomId', searchParams.get('roomId')!);
        }
        
        // Add date parameters if present, with proper formatting
        if (searchParams.has('dateFrom')) {
            const dateFrom = searchParams.get('dateFrom')!;
            // Extract just the date part YYYY-MM-DD from ISO string if needed
            const formattedDateFrom = dateFrom.includes('T') 
                ? dateFrom.split('T')[0] 
                : dateFrom;
            formattedParams.set('dateFrom', formattedDateFrom);
        }
        
        if (searchParams.has('dateTo')) {
            const dateTo = searchParams.get('dateTo')!;
            // Extract just the date part YYYY-MM-DD from ISO string if needed
            const formattedDateTo = dateTo.includes('T') 
                ? dateTo.split('T')[0] 
                : dateTo;
            formattedParams.set('dateTo', formattedDateTo);
        }
        
        // Add other common parameters if present
        if (searchParams.has('status')) {
            formattedParams.set('status', searchParams.get('status')!);
        }
        
        if (searchParams.has('provider')) {
            formattedParams.set('provider', searchParams.get('provider')!);
        }
        
        if (searchParams.has('search')) {
            formattedParams.set('search', searchParams.get('search')!);
        }
        
        if (searchParams.has('isRegistered')) {
            formattedParams.set('isRegistered', searchParams.get('isRegistered')!);
        }

        // Add companyId if present
        if (searchParams.has('companyId')) {
            formattedParams.set('companyId', searchParams.get('companyId')!);
        }

        // Copy any other parameters we haven't explicitly handled
        searchParams.forEach((value, key) => {
            if (!formattedParams.has(key)) {
                formattedParams.set(key, value);
            }
        });
        
        // Construct the full URL properly
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
            throw new Error('Failed to fetch appointments from backend');
        }

        const data = await response.json();
        return NextResponse.json({ data: data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching appointments: ${error.message}` }, { status: 500 });
    }
}

// POST API Route
export async function POST(request: NextRequest) {
    try {
        const token = getJwtToken(request);

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(`${apiUrl}/api/Appointment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ ...body}),
        });


        if (response.status === 401) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
              console.error('Create Appointment error:', errorData);
            return NextResponse.json(
                { message: errorData?.message || 'Failed to create Appointment' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
         console.error('Error creating Appointment:', error);
        return NextResponse.json(
            { message: 'Error creating Appointment' },
            { status: 500 }
        );
    }
}


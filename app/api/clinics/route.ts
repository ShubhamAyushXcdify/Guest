import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";
import { SAMPLE_CLINICS } from "@/queries/clinics/get-clinics";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

// GET API Route - Get all clinics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }

        // In a real app, we would call the backend API
        // For now, return sample data
        try {
            const response = await fetch(
                `${apiUrl}/api/Clinic${search ? `?search=${search}` : ''}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                // If API fails, return sample data for development
                console.warn("Using sample clinic data as backend API call failed");
                return NextResponse.json(SAMPLE_CLINICS.filter(clinic => 
                    search ? 
                    clinic.name.toLowerCase().includes(search.toLowerCase()) : 
                    true
                ), { status: 200 });
            }

            const data = await response.json();
            return NextResponse.json(data, { status: 200 });
        } catch (error) {
            // If error, return sample data for development
            console.warn("Using sample clinic data due to error:", error);
            return NextResponse.json(SAMPLE_CLINICS.filter(clinic => 
                search ? 
                clinic.name.toLowerCase().includes(search.toLowerCase()) : 
                true
            ), { status: 200 });
        }
    } catch (error: any) {
        console.error("Error in clinics GET route:", error);
        return NextResponse.json({ message: `Error fetching clinics: ${error.message}` }, { status: 500 });
    }
} 
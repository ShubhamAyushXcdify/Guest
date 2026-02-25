import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = getJwtToken(request);

        const pageNumber = searchParams.get("pageNumber") || "1";
        const pageSize = searchParams.get("pageSize") || "10";
        const companyId = searchParams.get("companyId") || "";
        const startDate = searchParams.get("startDate") || "";
        const endDate = searchParams.get("endDate") || "";

        // ✅ Handle both single clinicId and multiple clinicIds
        const singleClinicId = searchParams.get("clinicId");
        const multipleClinicIds = searchParams.getAll("clinicIds");

        const queryParams = new URLSearchParams({
            pageNumber,
            pageSize,
            ...(companyId && { companyId }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
        });

        // ✅ Add clinic IDs to query params - handle both single and multiple
        if (singleClinicId) {
            // If single clinicId is provided (clinic admin case)
            queryParams.append("ClinicIds", singleClinicId);
        }
        
        if (multipleClinicIds.length > 0) {
            // If multiple clinicIds are provided (admin with filters)
            multipleClinicIds.forEach((id) => queryParams.append("ClinicIds", id));
        }

        console.log("Final API URL:", `${apiUrl}/api/Expense?${queryParams.toString()}`);

        const response = await fetch(
            `${apiUrl}/api/Expense?${queryParams.toString()}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch expenses from backend");
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: `Error fetching expenses: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const token = getJwtToken(request);

        const response = await fetch(
            `${apiUrl}/api/Expense`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to create expense in backend");
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: `Error creating expense: ${error.message}` },
            { status: 500 }
        );
    }
}
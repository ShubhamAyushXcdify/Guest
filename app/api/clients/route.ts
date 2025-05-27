//here just want post and get all api endpoints

import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

// Sample client data for reference only
export const SAMPLE_CLIENTS = [
  {
    id: "7e7160a8-5d19-4727-bffd-1d232943c02b",
    clinicId: "69c3c549-590b-47e3-8581-967b6fc14753",
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@example.com",
    phonePrimary: "+1-555-123-4567",
    phoneSecondary: "+1-555-765-4321",
    addressLine1: "123 Maple Street",
    addressLine2: "Apt 4B",
    city: "Springfield",
    state: "Illinois",
    postalCode: "62704",
    emergencyContactName: "Michael Johnson",
    emergencyContactPhone: "+1-555-987-6543",
    notes: "Prefers morning appointments; has two dogs registered",
    isActive: true,
    createdAt: null,
    updatedAt: null
  },
  {
    id: "1727e1e3-2009-4c43-b689-598969944d6a",
    clinicId: "69c3c549-590b-47e3-8581-967b6fc14753",
    firstName: "Robert",
    lastName: "Smith",
    email: "robert.smith@example.com",
    phonePrimary: "+1-555-222-3333",
    phoneSecondary: "",
    addressLine1: "456 Oak Avenue",
    addressLine2: "",
    city: "Springfield",
    state: "Illinois",
    postalCode: "62704",
    emergencyContactName: "Mary Smith",
    emergencyContactPhone: "+1-555-444-5555",
    notes: "Prefers afternoon appointments; has a cat",
    isActive: true,
    createdAt: null,
    updatedAt: null
  },
  {
    id: "3a5e98b2-7c1d-4e34-8f6a-d6c789b12345",
    clinicId: "69c3c549-590b-47e3-8581-967b6fc14753",
    firstName: "Jennifer",
    lastName: "Davis",
    email: "jennifer.davis@example.com",
    phonePrimary: "+1-555-666-7777",
    phoneSecondary: "+1-555-888-9999",
    addressLine1: "789 Pine Road",
    addressLine2: "Unit 12",
    city: "Springfield",
    state: "Illinois",
    postalCode: "62704",
    emergencyContactName: "David Davis",
    emergencyContactPhone: "+1-555-111-2222",
    notes: "Has three cats and a rabbit",
    isActive: true,
    createdAt: null,
    updatedAt: null
  }
];

// GET API Route - Get all clients
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }

        const response = await fetch(
            `${apiUrl}/api/Client${search ? `?search=${search}` : ''}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch clients from backend');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Error in clients GET route:", error);
        return NextResponse.json({ message: `Error fetching clients: ${error.message}` }, { status: 500 });
    }
}

// POST API Route - Create a new client
export async function POST(request: NextRequest) {
    try {
        console.log("POST /api/clients route handler called");
        
        const body = await request.json();
        console.log("Request body:", body);
        
        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }

        console.log("Using token (masked):", token.substring(0, 10) + "...");
        console.log("Sending POST request to:", `${apiUrl}/api/Client`);
        
        const response = await fetch(
            `${apiUrl}/api/Client`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );

        console.log("Backend API response status:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Failed to get error details");
            console.error("Error response from backend:", errorText);
            throw new Error('Failed to create client');
        }

        const data = await response.json();
        console.log("Client created successfully, response data:", data);
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Error in clients POST route:", error);
        return NextResponse.json({ message: `Error creating client: ${error.message}` }, { status: 500 });
    }
}

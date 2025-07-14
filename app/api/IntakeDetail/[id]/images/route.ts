import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function POST(
    request: NextRequest,
    ctx: { params: Promise<{ intakeDetailId: string }> }
) {
    const { intakeDetailId } = await ctx.params;
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        const body = await request.json();
        
        const response = await fetch(`${apiUrl}/api/IntakeDetail/${intakeDetailId}/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to add image to intake detail' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error adding image to intake detail:', error);
        return NextResponse.json(
            { message: 'Error adding image to intake detail' },
            { status: 500 }
        );
    }
} 
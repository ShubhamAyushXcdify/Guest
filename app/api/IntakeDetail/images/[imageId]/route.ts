import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function DELETE(
    request: NextRequest,
    { params }: { params: { imageId: string } }
) {
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/IntakeDetail/images/${params.imageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to delete intake image' },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'Intake image deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting intake image:', error);
        return NextResponse.json(
            { message: 'Error deleting intake image' },
            { status: 500 }
        );
    }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function DELETE(
    request: NextRequest,
    ctx: { params: Promise<{ fileId: string }> }
) {
    const { fileId } = await ctx.params;
    try {
        let token = getJwtToken(request);

        if (!token) {
            token = testToken;
        }

        const response = await fetch(`${apiUrl}/api/IntakeDetail/file/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to delete intake file' },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting intake file:', error);
        return NextResponse.json(
            { message: 'Error deleting intake file' },
            { status: 500 }
        );
    }
} 
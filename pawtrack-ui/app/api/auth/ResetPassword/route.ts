import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (errorData.message) {
        return NextResponse.json({ error: errorData.message }, { status: response.status });
      }

      return NextResponse.json({ error: 'Password reset failed. Please try again.' }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({ status: 200, ...data });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}

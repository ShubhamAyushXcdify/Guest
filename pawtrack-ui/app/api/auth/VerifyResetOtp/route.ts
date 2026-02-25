import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (errorData.message) {
        return NextResponse.json({ error: errorData.message }, { status: response.status });
      }

      return NextResponse.json({ error: 'OTP verification failed. Please try again.' }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({ status: 200, ...data });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}

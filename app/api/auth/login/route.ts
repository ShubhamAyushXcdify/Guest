import { NextResponse } from 'next/server';



export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
      }

      if (response.status === 404) {
        return NextResponse.json({ error: 'Username not found' }, { status: 404 });
      }

      // If we have a specific error message from the backend, use it
      if (errorData.message) {
        return NextResponse.json({ error: errorData.message }, { status: response.status });
      }


      // Fallback error
      return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: response.status });
    }

    const data = await response.json();

    const token = data.token;
    const workspaceId = data.workspaceId;

    return NextResponse.json({ status: 200, ...data });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}



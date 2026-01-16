import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

type CertificateRequest = {
    visitId: string;
    certificateJson: string | string[];
};

export async function PUT(request: NextRequest) {
  try {
    const token = getJwtToken(request) || testToken;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { visitId, certificates } = body;
    
    // Validate required fields
    if (!visitId) {
      return NextResponse.json(
        { error: 'visitId is required' },
        { status: 400 }
      );
    }

    if (!certificates || !Array.isArray(certificates) || certificates.length === 0) {
      return NextResponse.json(
        { error: 'At least one certificate is required in the certificates array' },
        { status: 400 }
      );
    }

    // Validate each certificate has required fields
    for (const cert of certificates) {
      if (!cert.certificateTypeId) {
        return NextResponse.json(
          { error: 'Each certificate must have a certificateTypeId' },
          { status: 400 }
        );
      }
      if (!cert.certificateJson) {
        return NextResponse.json(
          { error: 'Each certificate must have certificateJson' },
          { status: 400 }
        );
      }
    }

    // Format the request body to match the exact required format
    const requestBody = {
      visitId,
      certificates: certificates.map(cert => ({
        certificateTypeId: cert.certificateTypeId,
        certificateJson: typeof cert.certificateJson === 'string' 
          ? cert.certificateJson 
          : JSON.stringify(cert.certificateJson)
      }))
    };

    console.log('Sending PUT request to backend:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${apiUrl}/api/Certificate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error response:', errorData);
      return NextResponse.json(
        { 
          message: errorData.message || 'Failed to update certificate',
          errors: errorData.errors
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Certificate updated successfully:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error updating certificate:', error);
    return NextResponse.json(
      { 
        message: 'Failed to update certificate',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getJwtToken(request) || testToken;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { visitId, certificates } = body;
    
    // Validate required fields
    if (!visitId) {
      return NextResponse.json(
        { error: 'visitId is required' },
        { status: 400 }
      );
    }

    if (!certificates || !Array.isArray(certificates) || certificates.length === 0) {
      return NextResponse.json(
        { error: 'At least one certificate is required in the certificates array' },
        { status: 400 }
      );
    }

    // Format the request body
    const requestBody = {
      visitId,
      certificates: certificates.map(cert => ({
        certificateTypeId: cert.certificateTypeId,
        certificateJson: typeof cert.certificateJson === 'string' 
          ? cert.certificateJson 
          : JSON.stringify(cert.certificateJson)
      }))
    };

    console.log('Sending POST request to backend:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${apiUrl}/api/Certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error response:', errorData);
      return NextResponse.json(
        { 
          message: errorData.message || 'Failed to create certificate',
          errors: errorData.errors
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Certificate created successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { 
        message: 'Failed to create certificate',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
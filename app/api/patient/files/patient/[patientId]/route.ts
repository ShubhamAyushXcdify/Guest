import { NextRequest, NextResponse } from "next/server"
import { getJwtToken } from "@/utils/serverCookie"

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`

// GET /api/patient/files/patient/[patientId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params
    if (!patientId) {
      return NextResponse.json({ message: "Patient ID is required" }, { status: 400 })
    }

    let token = getJwtToken(request)
    if (!token) token = testToken

    const response = await fetch(`${apiUrl}/api/patient/files/patient/${patientId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const msg = await response.text().catch(() => "Failed to fetch patient files")
      return NextResponse.json({ message: msg }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: `Error fetching patient files: ${error.message}` }, { status: 500 })
  }
}



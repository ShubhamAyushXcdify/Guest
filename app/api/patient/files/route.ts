import { NextRequest, NextResponse } from "next/server"
import { getJwtToken } from "@/utils/serverCookie"

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`

// POST /api/patient/files → forwards multipart/form-data to backend
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    let token = getJwtToken(request)
    if (!token) token = testToken

    // Forward as-is to backend
    const response = await fetch(`${apiUrl}/api/patient/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const msg = await response.text().catch(() => "Failed to upload patient files")
      return NextResponse.json({ message: msg }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: `Error uploading patient files: ${error.message}` }, { status: 500 })
  }
}



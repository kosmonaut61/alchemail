import { type NextRequest, NextResponse } from "next/server"
import { getPreamble, savePreamble } from "@/lib/preamble"

export async function GET() {
  try {
    const preamble = await getPreamble()
    return NextResponse.json({ preamble })
  } catch (error) {
    console.error("Error fetching preamble:", error)
    return NextResponse.json({ error: "Failed to fetch preamble" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { preamble } = await request.json()
    await savePreamble(preamble)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving preamble:", error)
    return NextResponse.json({ error: "Failed to save preamble" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

// This endpoint will be called by GitHub webhook when repository is updated
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // Parse the payload without signature verification
    let payload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      console.error("Invalid JSON payload:", error)
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    console.log("Webhook received:", payload.ref || "unknown ref")

    // Check if this is a push to main branch
    if (payload.ref === "refs/heads/main") {
      console.log("Repository updated, triggering data refresh...")

      // Trigger repository update and data processing
      try {
        // Update repository
        const cloneResponse = await fetch(`${request.nextUrl.origin}/api/clone-repo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force: false }),
        })

        if (cloneResponse.ok) {
          // Process data
          await fetch(`${request.nextUrl.origin}/api/process-data`, {
            method: "POST",
          })

          console.log("Data refresh completed successfully")
        }
      } catch (error) {
        console.error("Failed to refresh data:", error)
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" })
  } catch (error) {
    console.error("Webhook processing failed:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Also handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}

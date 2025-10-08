import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = await fetch(
      "https://ajqnvbdqzajegsstrces.functions.supabase.co/process_weight_event_worker?batch=50",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-function-secret": "dF8N7npKR9DzzDXYK36l6mp/0lULhzluh1UlB15S8aI=",
        },
        body: JSON.stringify({}),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Edge function error:", errorText)
      return NextResponse.json({ error: `Recalculation failed: ${response.statusText}` }, { status: response.status })
    }

    const data = await response.json().catch(() => ({}))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error calling edge function:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to recalculate weights" },
      { status: 500 },
    )
  }
}

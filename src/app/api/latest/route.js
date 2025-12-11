import { getLatest } from "@/lib/state.js";

export async function GET() {
  try {
    const latest = getLatest();

    if (!latest) {
      return Response.json({ message: "no data yet" }, { status: 200 });
    }

    return Response.json(latest, { status: 200 });

  } catch (err) {
    console.error("GET /api/latest error:", err);

    return Response.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

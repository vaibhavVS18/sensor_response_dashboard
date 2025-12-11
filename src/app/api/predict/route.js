import { analyzeSensor } from "@/lib/ai.js";
import { setLatest } from "@/lib/state.js";

export async function POST(req) {
  try {
    let sensor;

    // 1. Parse JSON safely
    try {
      sensor = await req.json();
    } catch (e) {
      return Response.json(
        { message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // 2. Validate required fields
    const required = ["temp", "humidity", "ir", "ax", "ay", "az"];
    for (const key of required) {
      if (sensor[key] === undefined) {
        return Response.json(
          { message: `Missing sensor field: ${key}` },
          { status: 400 }
        );
      }
    }

    // 3. (optional) Normalize sensor values to numbers
    const normalized = {
      temp: Number(sensor.temp),
      humidity: Number(sensor.humidity),
      ir: Number(sensor.ir),
      ax: Number(sensor.ax),
      ay: Number(sensor.ay),
      az: Number(sensor.az)
    };

    // 4. AI prediction from Gemini
    const prediction = await analyzeSensor(normalized);

    // 5. Build entry for UI/state
    const entry = {
      sensor: normalized,
      prediction,
      timestamp: new Date().toISOString()
    };

    // 6. Store in shared state
    setLatest(entry);

    // 7. Send response
    return Response.json(entry, { status: 200 });

  } catch (err) {
    console.error("API /predict error:", err);

    return Response.json(
      {
        error: "Internal server error",
        details: err.message
      },
      { status: 500 }
    );
  }
}

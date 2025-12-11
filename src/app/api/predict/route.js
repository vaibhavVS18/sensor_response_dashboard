import { analyzeSensor } from "@/lib/ai.js";
import { setLatest } from "@/lib/state.js";

export async function POST(req) {
  try {
    const sensor = await req.json();

    const required = ["temp", "humidity", "bpm", "spo2", "ax", "ay", "az"];
    for (const key of required) {
      if (sensor[key] === undefined) {
        return Response.json(
          { message: `Missing sensor field: ${key}` },
          { status: 400 }
        );
      }
    }

    const prediction = await analyzeSensor(sensor);

    const entry = {
      sensor,
      prediction,
      timestamp: new Date().toISOString(),
    };

    setLatest(entry);

    return Response.json(entry);

  } catch (err) {
    console.error("API /predict error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

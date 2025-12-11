import { analyzeSensor } from "@/lib/ai";
import { setLatest } from "@/lib/state";

export async function POST(req) {
  try {
    const { sensor } = await req.json();

    if (sensor === undefined) {
      return Response.json({ message: "Missing sensor" }, { status: 400 });
    }

    const prediction = await analyzeSensor(sensor);

    const entry = {
      sensor,
      prediction,
      timestamp: new Date().toISOString()
    };

    setLatest(entry);

    return Response.json(entry);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

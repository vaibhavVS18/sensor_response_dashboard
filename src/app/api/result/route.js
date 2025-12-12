import { analyzeSensor } from "@/lib/ai.js";

export async function POST(req) {
  try {
    const sensor = await req.json();

    const required = ["temp", "humidity", "ir", "ax", "ay", "az"];
    for (const key of required) {
      if (sensor[key] === undefined) {
        return Response.json(
          { message: `Missing field: ${key}` },
          { status: 400 }
        );
      }
    }

    const normalized = {
      temp: Number(sensor.temp),
      humidity: Number(sensor.humidity),
      ir: Number(sensor.ir),
      ax: Number(sensor.ax),
      ay: Number(sensor.ay),
      az: Number(sensor.az)
    };

    const prediction = await analyzeSensor(normalized);

    return Response.json({ sensor: normalized, prediction });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

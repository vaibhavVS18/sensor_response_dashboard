import { getLatest } from "@/lib/state.js";

export async function GET() {
  const data = getLatest();
  return Response.json(data || { message: "no data yet" });
}

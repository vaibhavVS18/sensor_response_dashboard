import { latest } from "@/lib/state.js";

export async function GET() {
  return Response.json(latest || { message: "no data yet" });
}

import { getHistory } from "@/lib/state.js";

export async function GET() {
  return Response.json(getHistory());
}

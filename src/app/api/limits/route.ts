import { remainingFor } from "@/server/guard";
import { readiness, serverConfig } from "@/server/config";

export async function GET(request: Request) {
  return Response.json({ available: readiness().ai, remainingUnits: await remainingFor(request), dailySessionCap: serverConfig.sessionCap }, { headers: { "Cache-Control": "no-store" } });
}

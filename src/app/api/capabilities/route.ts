import { readiness, serverConfig } from "@/server/config";

export async function GET() {
  const ready = readiness();
  return Response.json({
    ...ready,
    modes: ["voice", "vision", "workspace", "research", "studio", "coach", "lab"],
    languages: ["en", "fil"],
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null,
    turnstileRequired: Boolean(serverConfig.turnstileSecret),
    limits: { imageBytes: 5_000_000, voiceSeconds: 30 },
  }, { headers: { "Cache-Control": "no-store" } });
}

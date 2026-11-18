import { z } from "zod";
import { admit } from "@/server/guard";
import { serverConfig } from "@/server/config";
import { BodyTooLarge, readJson } from "@/server/body";

export const runtime = "nodejs";
export const maxDuration = 45;
const schema = z.object({ text: z.string().trim().min(1).max(1800), turnstileToken: z.string().max(2500).optional() });

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return Response.json({ code: "UNSUPPORTED_MEDIA", message: "Send JSON to this endpoint." }, { status: 415 });
  let raw: unknown;
  try { raw = await readJson(request, 12_000); }
  catch (error) { return Response.json(error instanceof BodyTooLarge ? { code: "TOO_LARGE", message: "Request is too large." } : { code: "INVALID_INPUT", message: "Spoken replies must be short." }, { status: error instanceof BodyTooLarge ? 413 : 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return Response.json({ code: "INVALID_INPUT", message: "Spoken replies must be short." }, { status: 400 });
  if (!serverConfig.elevenKey || !serverConfig.voiceId) return Response.json({ code: "VOICE_UNAVAILABLE", message: "Voice is not configured yet." }, { status: 503 });
  const admitted = await admit(request, 2);
  if (admitted.error) return admitted.error;
  try {
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(serverConfig.voiceId)}/stream?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": serverConfig.elevenKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text: parsed.data.text, model_id: serverConfig.ttsModel }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]),
    });
    if (!upstream.ok || !upstream.body) return Response.json({ code: "VOICE_UNAVAILABLE", message: "Spoken reply is temporarily unavailable." }, { status: 502 });
    const headers: HeadersInit = { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
    if (admitted.setCookie) headers["Set-Cookie"] = admitted.setCookie;
    return new Response(upstream.body, { headers });
  } catch { return Response.json({ code: "VOICE_UNAVAILABLE", message: "Spoken reply is temporarily unavailable." }, { status: 502 }); }
}

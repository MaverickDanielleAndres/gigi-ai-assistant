import { admit, verifyTurnstile } from "@/server/guard";
import { serverConfig } from "@/server/config";
import { BodyTooLarge, readBody } from "@/server/body";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) return Response.json({ code: "UNSUPPORTED_MEDIA", message: "Send a recording as multipart form data." }, { status: 415 });
  let form: FormData;
  try {
    const body = await readBody(request, 1_600_000);
    form = await new Request(request.url, { method: "POST", headers: { "Content-Type": request.headers.get("content-type") || "" }, body: body.buffer as ArrayBuffer }).formData();
  } catch (error) { return Response.json(error instanceof BodyTooLarge ? { code: "TOO_LARGE", message: "Voice recording is too large. Keep it under 30 seconds." } : { code: "INVALID_AUDIO", message: "Recording could not be read." }, { status: error instanceof BodyTooLarge ? 413 : 400 }); }
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size < 100 || audio.size > 1_500_000) return Response.json({ code: "INVALID_AUDIO", message: "Record up to 30 seconds of audio." }, { status: 400 });
  const mime = audio.type.split(";")[0];
  if (!["audio/webm", "audio/mp4", "audio/ogg"].includes(mime)) return Response.json({ code: "INVALID_AUDIO", message: "This recording format is not supported." }, { status: 400 });
  const bytes = Buffer.from(await audio.arrayBuffer());
  const webm = mime === "audio/webm" && bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  const mp4 = mime === "audio/mp4" && bytes.toString("ascii", 4, 8) === "ftyp";
  const ogg = mime === "audio/ogg" && bytes.toString("ascii", 0, 4) === "OggS";
  if (!(webm || mp4 || ogg)) return Response.json({ code: "INVALID_AUDIO", message: "This recording could not be validated." }, { status: 400 });
  if (!serverConfig.elevenKey) return Response.json({ code: "VOICE_UNAVAILABLE", message: "Voice is not configured yet." }, { status: 503 });
  const token = form.get("turnstileToken");
  if (!(await verifyTurnstile(typeof token === "string" ? token : undefined).catch(() => false))) return Response.json({ code: "CHECK_FAILED", message: "Please complete the visitor check and try again." }, { status: 403 });
  const admitted = await admit(request, 2);
  if (admitted.error) return admitted.error;
  try {
    const upstreamForm = new FormData();
    upstreamForm.set("file", new File([bytes], audio.name || `voice.${mime.split("/")[1]}`, { type: mime }));
    upstreamForm.set("model_id", "scribe_v2");
    const upstream = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": serverConfig.elevenKey }, body: upstreamForm, signal: AbortSignal.timeout(30_000) });
    if (!upstream.ok) return Response.json({ code: "VOICE_UNAVAILABLE", message: "Transcription is temporarily unavailable." }, { status: 502 });
    const data = (await upstream.json()) as { text?: string };
    const headers: HeadersInit = { "Cache-Control": "no-store" };
    if (admitted.setCookie) headers["Set-Cookie"] = admitted.setCookie;
    return Response.json({ text: typeof data.text === "string" ? data.text.slice(0, 12_000) : "" }, { headers });
  } catch { return Response.json({ code: "VOICE_UNAVAILABLE", message: "Transcription is temporarily unavailable." }, { status: 502 }); }
}

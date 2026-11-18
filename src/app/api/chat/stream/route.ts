import OpenAI from "openai";
import { chatRequestSchema, type ChatEvent } from "@/shared/contracts";
import { serverConfig } from "@/server/config";
import { admit } from "@/server/guard";
import { validateImage } from "@/server/image";
import { instructionsFor } from "@/server/prompts";
import { BodyTooLarge, readJson } from "@/server/body";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return Response.json({ code: "UNSUPPORTED_MEDIA", message: "Send JSON to this endpoint." }, { status: 415 });
  let raw: unknown;
  try { raw = await readJson(request, 7_500_000); }
  catch (error) { return Response.json(error instanceof BodyTooLarge ? { code: "TOO_LARGE", message: "Request is too large." } : { code: "BAD_JSON", message: "The request could not be read." }, { status: error instanceof BodyTooLarge ? 413 : 400 }); }
  const parsed = chatRequestSchema.safeParse(raw);
  if (!parsed.success) return Response.json({ code: "INVALID_INPUT", message: "Please check your message and try again." }, { status: 400 });
  const input = parsed.data;
  if (input.image && !validateImage(input.image.dataUrl)) return Response.json({ code: "INVALID_IMAGE", message: "Use a PNG, JPEG, or WebP image under 5 MB." }, { status: 400 });
  if (!serverConfig.openaiKey || !serverConfig.openaiModel) return Response.json({ code: "AI_UNAVAILABLE", message: "The AI provider is not configured yet." }, { status: 503 });
  const promptSize = input.text.length + input.history.reduce((size, turn) => size + turn.text.length, 0);
  const baseWeight = input.mode === "research" || input.mode === "lab" || input.image ? 2 : 1;
  const weight = Math.min(4, baseWeight + Number(promptSize > 6_000) + Number(promptSize > 18_000));
  const admitted = await admit(request, weight, input.requestId);
  if (admitted.error) return admitted.error;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      let closed = false;
      const safeClose = () => { if (!closed) { closed = true; controller.close(); } };
      const abort = new AbortController();
      request.signal.addEventListener("abort", () => abort.abort(), { once: true });
      try {
        send({ type: "start", requestId: input.requestId });
        if (input.mode === "research") send({ type: "status", label: "Checking live sources" });
        else if (input.image) send({ type: "status", label: "Looking at your image" });
        else send({ type: "status", label: "Thinking" });
        const history = input.history.map(turn => ({ role: turn.role, content: turn.text }));
        const content: Array<{type:"input_text";text:string}|{type:"input_image";image_url:string;detail:"auto"}> = [{ type: "input_text", text: input.text }];
        if (input.image) content.push({ type: "input_image", image_url: input.image.dataUrl, detail: "auto" });
        const client = new OpenAI({ apiKey: serverConfig.openaiKey, maxRetries: 0, timeout: 45_000 });
        const response = await client.responses.create({
          model: serverConfig.openaiModel,
          instructions: instructionsFor(input.mode),
          input: [...history, { role: "user", content }],
          tools: input.mode === "research" ? [{ type: "web_search" }] : undefined,
          tool_choice: input.mode === "research" ? "required" : undefined,
          store: false,
          stream: true,
          max_output_tokens: input.mode === "voice" ? 500 : 1400,
        }, { signal: abort.signal });
        const citations = new Set<string>();
        for await (const event of response) {
          if (event.type === "response.output_text.delta") send({ type: "text_delta", text: event.delta });
          if (event.type === "response.completed") {
            for (const item of event.response.output) {
              if (item.type !== "message") continue;
              for (const part of item.content) {
                if (part.type !== "output_text") continue;
                for (const annotation of part.annotations || []) {
                  if (annotation.type !== "url_citation" || citations.has(annotation.url)) continue;
                  let sourceUrl: URL;
                  try { sourceUrl = new URL(annotation.url); } catch { continue; }
                  if (!["https:", "http:"].includes(sourceUrl.protocol)) continue;
                  citations.add(annotation.url);
                  send({ type: "citation", title: annotation.title || sourceUrl.hostname, url: sourceUrl.href });
                }
              }
            }
          }
          if (event.type === "response.failed") throw new Error("provider_failed");
        }
        send({ type: "done" });
      } catch (error) {
        if (!request.signal.aborted) {
          console.error(JSON.stringify({ type: "chat_error", requestId: input.requestId, reason: error instanceof Error ? error.name : "unknown" }));
          send({ type: "error", code: "UPSTREAM_ERROR", message: "The assistant could not finish this answer. Please try again." });
        }
      } finally { safeClose(); }
    },
  });
  const headers: HeadersInit = { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (admitted.setCookie) headers["Set-Cookie"] = admitted.setCookie;
  return new Response(stream, { headers });
}

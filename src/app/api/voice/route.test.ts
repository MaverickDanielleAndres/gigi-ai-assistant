import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ admit: vi.fn(), verifyTurnstile: vi.fn() }));
vi.mock("@/server/guard", () => ({ admit: mocks.admit, verifyTurnstile: mocks.verifyTurnstile }));
vi.mock("@/server/config", () => ({ serverConfig: { elevenKey: "test-key", voiceId: "voice-1", ttsModel: "test-model" } }));

import { POST as transcribe } from "./transcribe/route";
import { POST as speak } from "./speak/route";

function audioRequest(bytes: Uint8Array, type = "audio/webm") {
  const form = new FormData();
  form.set("audio", new File([bytes as Uint8Array<ArrayBuffer>], "recording.webm", { type }));
  form.set("turnstileToken", "visitor-token");
  return new Request("https://demo.example/api/voice/transcribe", { method: "POST", body: form });
}

describe("voice API routes", () => {
  beforeEach(() => {
    mocks.admit.mockReset().mockResolvedValue({ error: null, setCookie: "test-cookie" });
    mocks.verifyTurnstile.mockReset().mockResolvedValue(true);
    vi.unstubAllGlobals();
  });

  it("rejects recordings with a forged MIME type before quota or provider calls", async () => {
    const response = await transcribe(audioRequest(new Uint8Array(200)));
    expect(response.status).toBe(400);
    expect(mocks.admit).not.toHaveBeenCalled();
  });

  it("requires the visitor check before transcription admission", async () => {
    mocks.verifyTurnstile.mockResolvedValue(false);
    const bytes = new Uint8Array(200); bytes.set([0x1a, 0x45, 0xdf, 0xa3]);
    const response = await transcribe(audioRequest(bytes));
    expect(response.status).toBe(403);
    expect(mocks.admit).not.toHaveBeenCalled();
  });

  it("validates and forwards an accepted recording", async () => {
    const bytes = new Uint8Array(200); bytes.set([0x1a, 0x45, 0xdf, 0xa3]);
    const upstream = vi.fn().mockResolvedValue(Response.json({ text: "hello" }));
    vi.stubGlobal("fetch", upstream);
    const response = await transcribe(audioRequest(bytes));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ text: "hello" });
    expect(mocks.admit).toHaveBeenCalledWith(expect.any(Request), 2);
    expect(upstream).toHaveBeenCalledWith("https://api.elevenlabs.io/v1/speech-to-text", expect.objectContaining({ method: "POST" }));
  });

  it("returns a generic 502 when transcription provider rejects a recording", async () => {
    const bytes = new Uint8Array(200); bytes.set([0x1a, 0x45, 0xdf, 0xa3]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("private provider detail", { status: 500 })));
    const response = await transcribe(audioRequest(bytes));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("private provider detail");
  });

  it("streams speech without exposing the provider key", async () => {
    const upstream = vi.fn().mockResolvedValue(new Response("audio", { headers: { "Content-Type": "audio/mpeg" } }));
    vi.stubGlobal("fetch", upstream);
    const request = new Request("https://demo.example/api/voice/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "Hello" }) });
    const response = await speak(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("audio/mpeg");
    expect(await response.text()).toBe("audio");
    expect(upstream.mock.calls[0][1].headers["xi-api-key"]).toBe("test-key");
    expect(response.headers.get("xi-api-key")).toBeNull();
  });

  it("bounds the speech request body before quota admission", async () => {
    const request = new Request("https://demo.example/api/voice/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "x".repeat(12_001) }) });
    const response = await speak(request);
    expect(response.status).toBe(413);
    expect(mocks.admit).not.toHaveBeenCalled();
  });
});

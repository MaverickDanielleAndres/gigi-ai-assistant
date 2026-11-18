import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ admit: vi.fn(), create: vi.fn() }));
vi.mock("@/server/guard", () => ({ admit: mocks.admit }));
vi.mock("@/server/config", () => ({ serverConfig: { openaiKey: "test-key", openaiModel: "test-model" } }));
vi.mock("openai", () => ({ default: class { responses = { create: mocks.create }; } }));

import { POST } from "./route";

const input = { requestId: "dc0e9dc1-f150-413e-b948-8cc5b8a4ffde", mode: "research", locale: "en", text: "What happened?", history: [] };
function request(body: unknown) { return new Request("https://demo.example/api/chat/stream", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://demo.example" }, body: JSON.stringify(body) }); }

describe("chat streaming route", () => {
  beforeEach(() => { mocks.admit.mockReset().mockResolvedValue({ error: null, setCookie: "test-cookie" }); mocks.create.mockReset(); });

  it("rejects malformed input before quota or provider calls", async () => {
    const response = await POST(request({ ...input, text: "" }));
    expect(response.status).toBe(400);
    expect(mocks.admit).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("charges a larger unit weight for a long context", async () => {
    mocks.create.mockResolvedValue((async function* () { yield { type: "response.output_text.delta", delta: "Done" }; })());
    const response = await POST(request({ ...input, mode: "studio", history: [{ role: "user", text: "x".repeat(7_000) }] }));
    await response.text();
    expect(mocks.admit).toHaveBeenCalledWith(expect.any(Request), 2, input.requestId);
  });

  it("rejects bodies exceeding the byte cap even without Content-Length", async () => {
    const response = await POST(request({ ...input, text: "x".repeat(7_500_000) }));
    expect(response.status).toBe(413);
    expect(mocks.admit).not.toHaveBeenCalled();
  });

  it("rejects a forged image signature before admission", async () => {
    const response = await POST(request({ ...input, mode: "vision", image: { name: "photo.jpg", dataUrl: `data:image/jpeg;base64,${Buffer.alloc(100).toString("base64")}` } }));
    expect(response.status).toBe(400);
    expect(mocks.admit).not.toHaveBeenCalled();
  });

  it("passes quota denials through without calling OpenAI", async () => {
    mocks.admit.mockResolvedValue({ error: Response.json({ code: "LIMIT_REACHED" }, { status: 429 }) });
    const response = await POST(request(input));
    expect(response.status).toBe(429);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("streams text and citation events using the research tool", async () => {
    mocks.create.mockResolvedValue((async function* () {
      yield { type: "response.output_text.delta", delta: "A useful answer." };
      yield { type: "response.completed", response: { output: [{ type: "message", content: [{ type: "output_text", annotations: [{ type: "url_citation", url: "https://source.example/a", title: "Source" }] }] }] } };
    })());
    const response = await POST(request(input));
    const events = (await response.text()).trim().split("\n").map(line => JSON.parse(line));
    expect(response.status).toBe(200);
    expect(response.headers.get("Set-Cookie")).toBe("test-cookie");
    expect(mocks.admit).toHaveBeenCalledWith(expect.any(Request), 2, input.requestId);
    expect(mocks.create.mock.calls[0][0]).toMatchObject({ model: "test-model", store: false, stream: true, tools: [{ type: "web_search" }] });
    expect(events.map(event => event.type)).toEqual(["start", "status", "text_delta", "citation", "done"]);
  });

  it("keeps upstream failures out of the client response", async () => {
    mocks.create.mockRejectedValue(new Error("private provider error"));
    const response = await POST(request({ ...input, mode: "studio" }));
    const output = await response.text();
    expect(output).toContain("UPSTREAM_ERROR");
    expect(output).not.toContain("private provider error");
  });
});

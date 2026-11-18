import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ eval: vi.fn(), get: vi.fn(), fetch: vi.fn() }));
vi.mock("@upstash/redis", () => ({ Redis: class { eval = mocks.eval; get = mocks.get; } }));
vi.mock("./config", () => ({ serverConfig: {
  redisUrl: "https://example.upstash.io", redisToken: "test", signingSecret: "a".repeat(40),
  publicEnabled: true, globalCap: 20, sessionCap: 8, turnstileSecret: "",
} }));

import { admit, sameOrigin, verifiedSession } from "./guard";

function request(headers?: HeadersInit) { return new Request("https://demo.example/api/chat/stream", { method: "POST", headers }); }

describe("public API admission", () => {
  beforeEach(() => { mocks.eval.mockReset().mockResolvedValue(0); });

  it("rejects cross origin browser requests", () => {
    expect(sameOrigin(request({ Origin: "https://evil.example" }))).toBe(false);
    expect(sameOrigin(request({ "Sec-Fetch-Site": "cross-site" }))).toBe(false);
    expect(sameOrigin(request({ Origin: "https://demo.example" }))).toBe(true);
  });

  it("issues a signed, HTTP-only cookie after atomic admission", async () => {
    const result = await admit(request(), 2, "a-request");
    expect(result.error).toBeNull();
    expect(result.setCookie).toContain("HttpOnly");
    expect(result.setCookie).toContain("Secure");
    const raw = result.setCookie?.split(";")[0].split("=")[1];
    expect(verifiedSession(raw)).toBe(result.session);
    expect(verifiedSession(`${raw}tampered`)).toBeNull();
    expect(mocks.eval).toHaveBeenCalledOnce();
  });

  it("returns a retryable 429 without issuing a new session on a quota denial", async () => {
    mocks.eval.mockResolvedValue(4);
    const result = await admit(request(), 1);
    expect(result.error?.status).toBe(429);
    expect(result.error?.headers.get("Retry-After")).toBe("120");
    expect(result.setCookie).toBeUndefined();
  });

  it("rejects replayed request IDs", async () => {
    mocks.eval.mockResolvedValue(-1);
    const result = await admit(request(), 1, "replayed-id");
    expect(result.error?.status).toBe(409);
    expect((await result.error?.json()).code).toBe("DUPLICATE_REQUEST");
  });

  it("fails closed if Redis is unavailable", async () => {
    mocks.eval.mockRejectedValue(new Error("down"));
    const result = await admit(request(), 1);
    expect(result.error?.status).toBe(503);
  });
});

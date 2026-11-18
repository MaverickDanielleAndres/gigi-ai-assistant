import { afterEach, describe, expect, it, vi } from "vitest";

describe("provider readiness", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

  it("stays unavailable without provider and quota credentials", async () => {
    vi.stubEnv("PUBLIC_DEMO_ENABLED", "false");
    vi.resetModules();
    const { readiness } = await import("./config");
    expect(readiness()).toMatchObject({ ai: false, voice: false, vision: false, research: false });
  });

  it("requires a strong signing secret for the public AI route", async () => {
    vi.stubEnv("PUBLIC_DEMO_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test");
    vi.stubEnv("OPENAI_MODEL", "test-model");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test");
    vi.stubEnv("SESSION_SIGNING_SECRET", "short");
    vi.resetModules();
    expect((await import("./config")).readiness().ai).toBe(false);
    vi.stubEnv("SESSION_SIGNING_SECRET", "a".repeat(40));
    vi.resetModules();
    expect((await import("./config")).readiness().ai).toBe(true);
  });

  it("uses safe caps when environment values are invalid", async () => {
    vi.stubEnv("DAILY_GLOBAL_REQUEST_CAP", "NaN");
    vi.stubEnv("DAILY_SESSION_REQUEST_CAP", "-4");
    vi.resetModules();
    const { serverConfig } = await import("./config");
    expect(serverConfig.globalCap).toBe(150);
    expect(serverConfig.sessionCap).toBe(8);
    expect(serverConfig.ttsModel).toBe("eleven_v4");
  });
});

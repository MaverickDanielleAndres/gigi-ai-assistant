import { describe, expect, it } from "vitest";
import { BodyTooLarge, readBody, readJson } from "./body";

describe("bounded request bodies", () => {
  it("reads a valid JSON request", async () => {
    const request = new Request("https://example.com/api", { method: "POST", body: JSON.stringify({ text: "hello" }) });
    await expect(readJson(request, 100)).resolves.toEqual({ text: "hello" });
  });

  it("rejects a streamed body without Content-Length once the byte cap is crossed", async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) { controller.enqueue(new TextEncoder().encode("12345")); controller.enqueue(new TextEncoder().encode("67890")); controller.close(); },
    });
    const request = new Request("https://example.com/api", { method: "POST", body, duplex: "half" } as RequestInit);
    await expect(readBody(request, 8)).rejects.toBeInstanceOf(BodyTooLarge);
  });

  it("rejects an announced oversized body before reading it", async () => {
    const request = new Request("https://example.com/api", { method: "POST", body: "hello", headers: { "Content-Length": "500" } });
    await expect(readBody(request, 20)).rejects.toBeInstanceOf(BodyTooLarge);
  });
});

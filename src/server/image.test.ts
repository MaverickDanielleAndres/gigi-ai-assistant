import { describe, expect, it } from "vitest";
import { validateImage } from "./image";

describe("image validation", () => {
  const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), Buffer.alloc(16)]).toString("base64");
  it("accepts an image with matching MIME and signature", () => expect(validateImage(`data:image/png;base64,${png}`)).toBe(true));
  it("rejects a mismatched MIME and signature", () => expect(validateImage(`data:image/jpeg;base64,${png}`)).toBe(false));
  it("rejects SVG and oversized images", () => {
    expect(validateImage("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(validateImage(`data:image/png;base64,${Buffer.alloc(5_000_001).toString("base64")}`)).toBe(false);
  });
});

import { describe, expect, it, vi } from "vitest";
import { consumeQuota, quotaPlan, quotaScript } from "./quota";

describe("quota admission", () => {
  it("uses five shared windows and an optional idempotency key", () => {
    const plan = quotaPlan({ day: "2026-11-18", minute: "2026-11-18T12:42", session: "session", ipHash: "hashed", requestId: "request", globalCap: 150, sessionCap: 8, weight: 2 });
    expect(plan.keys).toHaveLength(6);
    expect(plan.keys[0]).toBe("limit:g:2026-11-18");
    expect(plan.keys[5]).toBe("request:session:request");
    expect(plan.args).toEqual(["2", "150", "8", "24", "30", "4"]);
  });

  it("runs the full decision in one Redis EVAL call", async () => {
    const evalMock = vi.fn().mockResolvedValue(0);
    const plan = quotaPlan({ day: "today", minute: "now", session: "s", ipHash: "h", globalCap: 10, sessionCap: 3, weight: 1 });
    await expect(consumeQuota({ eval: evalMock } as never, plan)).resolves.toBe(0);
    expect(evalMock).toHaveBeenCalledOnce();
    expect(evalMock).toHaveBeenCalledWith(quotaScript, plan.keys, plan.args);
    expect(quotaScript).toContain("if used + weight >");
  });
});

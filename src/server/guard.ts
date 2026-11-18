import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";
import { serverConfig } from "./config";
import { consumeQuota, quotaPlan } from "./quota";

const cookieName = "gigi_session";
export const redis = serverConfig.redisUrl && serverConfig.redisToken ? new Redis({ url: serverConfig.redisUrl, token: serverConfig.redisToken }) : null;

function sign(value: string) { return createHmac("sha256", serverConfig.signingSecret).update(value).digest("hex"); }
export function verifiedSession(raw?: string) {
  if (!raw || serverConfig.signingSecret.length < 32) return null;
  const [id, mac] = raw.split(".");
  if (!id || !mac || !/^[\da-f-]{36}$/.test(id) || !/^[\da-f]{64}$/.test(mac)) return null;
  const actual = Buffer.from(mac, "hex");
  const expected = Buffer.from(sign(id), "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? id : null;
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (site && !["same-origin", "none"].includes(site)) return false;
  try { return !origin || new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

export async function verifyTurnstile(token?: string) {
  if (!serverConfig.turnstileSecret) return true;
  if (!token) return false;
  const form = new FormData();
  form.set("secret", serverConfig.turnstileSecret);
  form.set("response", token);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, signal: AbortSignal.timeout(5000) });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function admit(request: Request, weight: number, requestId?: string) {
  if (!sameOrigin(request)) return { error: Response.json({ code: "BAD_ORIGIN", message: "Request origin is not allowed." }, { status: 403 }) };
  if (!serverConfig.publicEnabled || !redis || serverConfig.signingSecret.length < 32) return { error: Response.json({ code: "NOT_CONFIGURED", message: "Live AI is not configured for this public demo yet." }, { status: 503 }) };
  const cookie = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const existing = verifiedSession(cookie);
  const session = existing || randomUUID();
  const setCookie = existing ? null : `${cookieName}=${session}.${sign(session)}; HttpOnly; SameSite=Lax; ${new URL(request.url).protocol === "https:" ? "Secure; " : ""}Path=/; Max-Age=604800`;
  const day = new Date().toISOString().slice(0, 10);
  const minute = new Date().toISOString().slice(0, 16);
  // Vercel overwrites this header at its edge. The global quota remains the
  // final spend ceiling even when a client has no usable network identity.
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = createHmac("sha256", serverConfig.signingSecret).update(`${day}:${ip}`).digest("hex").slice(0, 24);
  try {
    const result = await consumeQuota(redis, quotaPlan({ day, minute, session, ipHash, requestId, globalCap: serverConfig.globalCap, sessionCap: serverConfig.sessionCap, weight }));
    if (result === -1) return { error: Response.json({ code: "DUPLICATE_REQUEST", message: "This request is already being processed." }, { status: 409 }) };
    if (result !== 0) return { error: Response.json({ code: "LIMIT_REACHED", message: "The public demo limit has been reached. Please try again later." }, { status: 429, headers: { "Retry-After": result >= 4 ? "120" : "3600" } }) };
    return { error: null, setCookie, session };
  } catch {
    return { error: Response.json({ code: "LIMIT_STORE_UNAVAILABLE", message: "The assistant is temporarily unavailable. Please try again later." }, { status: 503 }) };
  }
}

export async function remainingFor(request: Request) {
  if (!redis || serverConfig.signingSecret.length < 32) return null;
  const cookie = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const session = verifiedSession(cookie);
  if (!session) return serverConfig.sessionCap;
  const day = new Date().toISOString().slice(0, 10);
  try { const used = await redis.get<number>(`limit:s:${day}:${session}`); return Math.max(0, serverConfig.sessionCap - Number(used || 0)); }
  catch { return null; }
}

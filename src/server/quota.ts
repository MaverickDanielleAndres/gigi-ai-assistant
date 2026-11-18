import type { Redis } from "@upstash/redis";

// One Redis execution decides and charges all quotas together. Rejected requests
// do not consume another quota, and simultaneous serverless invocations serialize.
export const quotaScript = `
local weight = tonumber(ARGV[1])
for i = 1, 5 do
  local used = tonumber(redis.call('GET', KEYS[i]) or '0')
  if used + weight > tonumber(ARGV[i + 1]) then return i end
end
if KEYS[6] ~= '' and redis.call('EXISTS', KEYS[6]) == 1 then return -1 end
for i = 1, 5 do
  redis.call('INCRBY', KEYS[i], weight)
  if redis.call('TTL', KEYS[i]) < 0 then
    redis.call('EXPIRE', KEYS[i], i <= 3 and 172800 or 120)
  end
end
if KEYS[6] ~= '' then redis.call('SET', KEYS[6], '1', 'EX', 3600) end
return 0`;

export function quotaPlan(input: { day: string; minute: string; session: string; ipHash: string; requestId?: string; globalCap: number; sessionCap: number; weight: number }) {
  const { day, minute, session, ipHash, requestId, globalCap, sessionCap, weight } = input;
  return {
    keys: [`limit:g:${day}`, `limit:s:${day}:${session}`, `limit:ip:${day}:${ipHash}`, `limit:gm:${minute}`, `limit:sm:${minute}:${session}`, requestId ? `request:${session}:${requestId}` : ""],
    args: [weight, globalCap, sessionCap, Math.max(sessionCap * 3, 12), 30, 4].map(String),
  };
}

export async function consumeQuota(store: Pick<Redis, "eval">, plan: ReturnType<typeof quotaPlan>): Promise<number> {
  return Number(await store.eval(quotaScript, plan.keys, plan.args));
}

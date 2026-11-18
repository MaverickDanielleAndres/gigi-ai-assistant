export const serverConfig = {
  openaiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "",
  elevenKey: process.env.ELEVENLABS_API_KEY || "",
  voiceId: process.env.ELEVENLABS_VOICE_ID || "",
  ttsModel: process.env.ELEVENLABS_TTS_MODEL || "eleven_v4",
  redisUrl: process.env.UPSTASH_REDIS_REST_URL || "",
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  signingSecret: process.env.SESSION_SIGNING_SECRET || "",
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY || "",
  publicEnabled: process.env.PUBLIC_DEMO_ENABLED === "true",
  globalCap: positiveInt(process.env.DAILY_GLOBAL_REQUEST_CAP, 150),
  sessionCap: positiveInt(process.env.DAILY_SESSION_REQUEST_CAP, 8),
};

function positiveInt(value: string | undefined, fallback: number) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

export function readiness() {
  const ai = Boolean(serverConfig.publicEnabled && serverConfig.openaiKey && serverConfig.openaiModel && serverConfig.redisUrl && serverConfig.redisToken && serverConfig.signingSecret.length >= 32);
  const voice = Boolean(ai && serverConfig.elevenKey && serverConfig.voiceId && (!serverConfig.turnstileSecret || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY));
  return { ai, voice, vision: ai, research: ai, reason: ai ? null : "Live AI is awaiting provider and public-demo configuration." };
}

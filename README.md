# GIGI — multimodal assistant portfolio

A two-page public portfolio app: a cinematic landing page at `/` and a no-login assistant at `/app`. The design follows [BRANDING.md](./BRANDING.md); the architecture and staged scope are in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without credentials, the pages, mode navigation, local Workspace notes, and export work; live AI and voice are clearly marked as unavailable. This is intentional and prevents a fake demo response.

## Connect live services

Copy `.env.example` to `.env.local` and fill in the server-side settings. Never commit `.env.local` or paste keys into a public issue/chat.

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Responses API key for text, vision, and research. |
| `OPENAI_MODEL` | A model confirmed to support Responses, image input, and `web_search`; choose after quality/cost testing. |
| `ELEVENLABS_API_KEY` | Scribe v2 and speech output. |
| `ELEVENLABS_VOICE_ID` | A tested, authorized English/Filipino-capable voice. |
| `ELEVENLABS_TTS_MODEL` | Selected HTTP Stream Speech model (defaults to `eleven_v4`; verify with the chosen voice). |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared quota store. Billable endpoints fail closed when it is unavailable. |
| `SESSION_SIGNING_SECRET` | Random, private secret of at least 32 bytes for anonymous quota cookies. |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional in local development; configure both before a public voice launch. The private key stays server-side. |
| `PUBLIC_DEMO_ENABLED` | Set `true` only after keys, limits, and provider spending caps are configured. |
| `DAILY_GLOBAL_REQUEST_CAP`, `DAILY_SESSION_REQUEST_CAP` | Weighted request-unit ceilings; Research, image, Lab, and voice cost more units. |
| `NEXT_PUBLIC_SITE_URL` | Canonical HTTPS origin for metadata, robots and sitemap after you assign a domain. |

Restart the development server after editing `.env.local`. Set separate hard spending caps in the OpenAI and ElevenLabs dashboards. Request limits reduce abuse but are not a substitute for provider spending caps.

## What is implemented

- Responsive landing with the supplied interactive WebGL2 Orb and a static/reduced-motion fallback.
- Assistant shell with seven purposeful modes, English/Filipino UI selection, starter prompts, streaming answer display, source links, and stop control.
- Image attachment for PNG/JPEG/WebP up to 5 MB, validated again on the server.
- Research mode that requires OpenAI's `web_search` tool and displays returned citation annotations.
- Browser-local conversation and Workspace with pinned answers, editable quick notes and drafts, clear, and Markdown export.
- Press-to-talk voice: explicit microphone permission, up to 30 seconds of recording, server-mediated ElevenLabs Scribe transcription, and an optional spoken reply via ElevenLabs TTS.
- Server-only API keys, anonymous signed session, atomic Redis global/session/network and minute quotas, strict body limits, and a visitor check for voice uploads when Turnstile is configured.

## Current boundaries

- No keys are included. Provider responses, English/Filipino voice quality, citations, and real spend cannot be verified until the owner supplies accounts and an approved budget.
- Browser-local history does not sync across devices. Clearing browser storage removes it.
- Full-duplex voice, image generation, and shareable public artifacts are future phases in the plan.
- The API enforces bounded request units, prompt history, output length, image size, and recording upload size. Review real provider billing and tighten caps before making the demo public.
- GIGI is the product name across the landing page and assistant.

## Verification

```bash
npm run verify
```

`verify` runs type checking, lint, 29 offline unit/integration tests, and the Vercel-style production build. The API tests mock the providers and quota store; real OpenAI, ElevenLabs, Turnstile and Upstash calls still need a staging pass with owner-provided credentials. Local Lighthouse results and remaining risks are in [QA_REPORT.md](./QA_REPORT.md).

For production, also test `/`, `/app`, `/api/capabilities`, `/api/limits`, and all billable endpoints with real provider staging keys; keyboard and mobile layouts; denied microphone permission; reduced motion; quota exhaustion; and provider failures. Follow the launch checklist in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

## Documentation used

[Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) · [OpenAI Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create) · [OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search) · [ElevenLabs Scribe v2](https://elevenlabs.io/docs/api-reference/speech-to-text/convert) · [ElevenLabs streaming TTS](https://elevenlabs.io/docs/api-reference/text-to-speech/stream) · [Cloudflare Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

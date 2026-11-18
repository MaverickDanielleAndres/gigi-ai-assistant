# GIGI — verification report

**Date:** 18 November 2026. **Target:** local Next.js production build, without provider credentials.

## Result

`npm run verify` passes. It runs TypeScript, ESLint, 29 offline tests in 7 files, and `next build` on Next.js 16.4.6. The build prerenders `/` and `/app`; API routes remain request driven. HTTP smoke checks returned 200 for both pages, capability/limit endpoints, `robots.txt`, and `sitemap.xml`. A valid chat request without credentials returned the expected 503 `NOT_CONFIGURED` response. The inspected responses carried CSP and HSTS headers.

| Local Lighthouse profile | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Landing, mobile | 97 | 100 | 100 | 100 | 0.8 s | 0 |
| Landing, desktop | 100 | 100 | 100 | 100 | 0.2 s | 0 |
| App, mobile | 97 | 100 | 100 | 100 | 0.9 s | 0 |
| App, desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 |

Lighthouse 13.6.0 measured `next start` at localhost with Chrome headless before the GIGI naming update. Mobile performance varied across runs, including 90–99 for the landing and 95–97 for the app. The naming update passed the full build gate, and the captures below were refreshed on that build. These are local lab results, not a guarantee of a 100 PageSpeed score on a future Vercel URL. Recheck the actual domain and representative mobile hardware after deployment. The raw `lighthouse-*.json` audits stay local; the committed mobile and desktop captures are `qa-landing-mobile.png`, `qa-app-mobile.png`, `qa-landing-desktop.png`, and `qa-app-desktop.png`.

## Offline coverage

- Request body caps reject oversized streams even without `Content-Length`; JSON parse errors remain bounded.
- Chat rejects malformed payloads, weights long contexts, streams text and citations, and hides provider errors from clients.
- Voice routes reject MIME/signature mismatches, require a configured visitor check before transcription, proxy a valid recording, and stream audio without exposing the provider key.
- Image validation checks type, size, and magic bytes. Readiness rejects short signing secrets and unsafe cap values.
- Admission tests cover same-origin checks, signed cookie verification, atomic Redis `EVAL` invocation, burst denials, and fail-closed behavior when Redis is unavailable.

The tests use mock providers and a mock Redis boundary. They verify application contracts and failure handling but cannot prove a real model answer, voice quality, billing, or Redis script behavior against Upstash. [Upstash documents that EVAL runs atomically](https://upstash.com/docs/redis/commands/scripting/eval); the live integration still needs a staging test.

## Security and scale decisions

- Credentials stay server-side; `.env.local` is ignored. Public AI remains disabled until the required provider, Redis, and signing settings are present.
- Billable routes use one shared Redis quota decision across global, session, network, and minute windows. Requests are rejected without partially charging another window. Long prompts cost more units.
- Requests have schema, media type, byte, recording, image, prompt-history, and output caps. Provider calls have bounded time and do not retry a stream automatically.
- The public session cookie is signed, HTTP-only, SameSite Lax, and Secure on HTTPS. The app checks browser origins, sends no permissive CORS header, applies response security headers, and treats AI output as text.
- The production dependency audit (`npm audit --omit=dev`) reported **0 known vulnerabilities**. The full audit reported **17 findings in development tooling**; npm's suggested forced fixes would downgrade or conflict with the pinned Next.js/testing toolchain. Review these advisories during dependency updates before release.

## Before public launch

1. Add OpenAI, ElevenLabs, and Upstash staging credentials and a 32+ character signing secret in Vercel environment variables; set the canonical HTTPS `NEXT_PUBLIC_SITE_URL`.
2. Configure both Turnstile keys for public voice input and hard spend limits in the provider dashboards. Application request quotas are not monetary billing limits.
3. Exercise real text, image, research citations, Scribe transcription, and `eleven_v4` streaming speech in English, Filipino, and mixed language with the chosen voice. The ElevenLabs docs list [`eleven_v4` for HTTP Stream Speech](https://elevenlabs.io/docs/api-reference/text-to-speech/stream) and [Filipino for the v4 family](https://elevenlabs.io/docs/overview/models/).
4. Run concurrent and outage tests against the actual Upstash database. Confirm Vercel function duration and provider account quotas under the intended deployment plan.
5. Run PageSpeed Insights on the Vercel production URL and test touch navigation, keyboard focus, reduced motion, denied microphone permission, and storage clearing on real devices.

# GIGI — brand and UX specification

**Status:** implementation specification · **Version:** 1.1 · **Updated:** 18 November 2026

**Product:** public, no-login portfolio experience with two routes: `/` and `/app`

**Product name:** `GIGI`

> This document governs brand, visual design, interaction, content, and UX implementation. The product specification governs model features, APIs, costs, and safety behavior. Where those choices affect the interface, this document supplies the required user experience.

## 1. Product idea and design promise

`GIGI` is a voice-first, multimodal assistant that helps a visitor move from a thought to a useful result. It should feel like a calm, capable creative instrument: immediate to try, credible in its answers, and unusually polished for a public portfolio project.

**Design promise:** *A thought becomes a conversation. A conversation becomes something useful.* This is positioning guidance, not a required final tagline.

**Audience:** curious visitors, potential clients/employers, makers, researchers, and people testing AI in English or Filipino. Assume a first-time visitor who has not read any instructions.

**Personality:** lucid, poised, warm, precise, quietly inventive. Avoid sci-fi theatrics, anthropomorphic claims, exaggerated intelligence claims, and jargon-heavy marketing.

**Experience principles, in priority order:**

1. The visitor can start with text in seconds, without a tutorial or account.
2. Voice and vision invite discovery while retaining clear permissions and controls.
3. The assistant always shows what it is doing, what it knows, and what failed.
4. The orb makes system state legible; it never replaces text labels or status messages.
5. The landing page earns the click; the app earns continued use.
6. Visual drama yields to readability, performance, and keyboard access.

## 2. Reference translation and originality boundary

The supplied Arkon reference and screenshot establish the **quality bar**: near-black canvas; editorial contrast between a large expressive headline and restrained utility text; wide negative space; an iridescent three-dimensional focal object; strong alignment; cinematic light; purposeful motion. The reference screenshot also shows a highly sparse desktop composition with the object centered between type and supporting content.

Create an **original** system for this assistant:

| Borrow the principle | Our interpretation |
| --- | --- |
| Editorial scale | A compact serif italic phrase paired with an oversized, clean grotesk statement; new wording and proportions. |
| Iridescent focal object | A luminous **GIGI orb**: a dark center with a violet-to-cyan light ring; it changes meaningfully with voice state. |
| Deep black space | Warm near-black surfaces and fine luminous separators, with accessible text contrast. |
| Cinematic motion | Brief, choreographed reveals and a responsive orb; controls remain still and dependable. |
| Sparse information | Few visible actions at once; progressive disclosure for advanced tools. |

Do not reproduce Arkon's logo, page grid, title wording, exact orb material/texture, scene, reflection, navigation labels, or animation sequence. Do not use its screenshots or assets in the product. The orb should be recognizable as this product's interface, not as the referenced site's artwork.

## 3. Brand identity

### Naming and verbal identity

- Use `GIGI` consistently in source copy, UI, metadata, and exports. Do not create a fake trademark or imply registration.
- Working descriptor: **Voice, vision, and ideas in one place.**
- Candidate hero line for design exploration: *Say it. See it. Shape it.* This is original draft copy, not a locked brand name or slogan.
- Write in direct second person; use short, concrete verbs: **Ask, Speak, Add image, Explore, Compare, Make, Save**.
- Support English and Filipino UI copy. English is the default if browser preference is unavailable; provide an explicit language switch. Preserve user-entered language and never auto-translate silently.
- Voice: human and exact. Examples: “Listening. Speak when you're ready.”, “I could not hear that clearly. Try again or type it.”, “Sources are available below.” Avoid “I have perfect understanding,” “magic,” and claims of factual certainty.

### Logo and mark

- Start with a custom, simple wordmark. The identity mark may be a reduced ring with one displaced segment, representing an opening for input and a path outward to output.
- A one-color mark must work at 16–24 px and on both dark and light backgrounds. The gradient orb is never the only logo.
- Keep logotype, app icon, favicon, and loading mark geometrically related; do not use generic sparkle clusters, a microphone silhouette, or a copied orbital symbol.
- Clear space: at least the height of the mark's inner gap. Minimum digital wordmark width: 96 px. Verify legibility in actual browser renders.

## 4. Visual system

### Color tokens

The interface is predominantly black, ivory, and cool gray. Iridescence is concentrated in the orb and rare emphasis states. Values below are design starting points; measure contrast again in final composites, especially where translucency is used.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#08090B` | Main page canvas |
| `--surface-1` | `#111317` | Composer, app panels |
| `--surface-2` | `#191C22` | Elevated menus, hover surfaces |
| `--stroke` | `#343842` | Borders and separators |
| `--text` | `#F4F2ED` | Primary text |
| `--text-muted` | `#B5B9C2` | Secondary text and labels |
| `--text-soft` | `#89909D` | Tertiary text only where contrast passes |
| `--accent-lilac` | `#C5B9FF` | Selected state, focus, sparse emphasis |
| `--accent-cyan` | `#9AE8E5` | Listening/vision signal |
| `--accent-rose` | `#F3A7C8` | Speaking/studio signal |
| `--success` | `#9DD8B2` | Completed state |
| `--warning` | `#F4C67A` | Limits and caution |
| `--error` | `#F5A3A3` | Failures |

**Color rules:** never place regular text directly over the animated orb or a gradient. Put copy on an opaque surface. Reserve saturated accent color for one primary interactive emphasis per region. Use color with a label or icon for status. Avoid glass cards stacked on glass cards, neon outlines everywhere, and broad purple-blue gradient fills.

**Orb material:** deep dark center, a luminous violet/cyan/blue rim, and a restrained ground glow. The supplied WebGL2 Orb is the visual source of truth for this component. Keep its hero presentation dramatic and its app presentation small and operational.

### Typography

Use a three-role system. Suggested open-source font candidates: **Space Grotesk** (display/UI), **Instrument Serif Italic** (editorial phrase), and **IBM Plex Mono** (technical labels). Verify license, availability, glyph coverage, and Filipino diacritics before shipping; use local hosting or sensible fallbacks. Fallback stacks: `Arial, sans-serif`; `Georgia, serif`; `ui-monospace, monospace`.

| Role | Desktop | Mobile | Rule |
| --- | --- | --- | --- |
| Hero display | `clamp(4.5rem, 9vw, 10rem)` / 0.88–0.98 line-height | `clamp(3.3rem, 14vw, 5.5rem)` | Tight tracking; 2–4 short lines at most |
| Editorial italic | 0.55–0.75 of display size | 0.65–0.8 of display size | One phrase only, never a full paragraph |
| Section heading | `clamp(2.5rem, 5vw, 5.5rem)` | `clamp(2.2rem, 8vw, 3.6rem)` | Quiet, generous breathing room |
| App heading | 1.5–2rem | 1.25–1.5rem | Maintain compact hierarchy |
| Body | 16–18 px / 1.5–1.65 | 16 px / 1.5–1.65 | Long reading uses sentence case |
| Utility/label | 12–13 px / 1.35 | 12–13 px / 1.35 | Mono; never long all-caps passages |

Use real text, never text baked into an image. Limit the landing hero to one display family, one serif intervention, and utility mono. Avoid mechanically repeating the reference's typography composition.

### Grid, spacing, shape, and imagery

- Base spacing unit: 4 px. Preferred steps: 8, 12, 16, 24, 32, 48, 64, 96, 128 px.
- Desktop container: max 1440 px, 48–72 px side gutters. Tablet: 32 px. Mobile: 16–24 px. Ensure readable content width of 60–75 characters for prose.
- Landing: asymmetrical editorial grid with deliberate empty space. Chat: stable application grid with a clear reading column; avoid a decorative layout that moves the composer unpredictably.
- Radii: 8 px for small controls, 14–18 px for panels, full pill only for primary actions/chips. Use crisp 1 px strokes and restrained shadows.
- Imagery: product-generated visual fragments, abstract signal imagery, and authentic interface captures. No generic robot/brain stock art, fake device mockups, or unlicensed reference imagery.
- Grain is optional and very subtle; it must not reduce text contrast. No noisy background behind transcript text.

## 5. Two-page information architecture

Two public routes, no account, no login, no onboarding gate:

```text
/
  Landing page: brand story → capability proof → invitation to try
  Primary CTA: Open the assistant → /app

/app
  AI chat app: text + voice + image entry → mode/tool selection → results
  Header link: Back to landing → /
```

Both URLs must load directly and preserve browser back/forward behavior. Visitors should understand that an active session may be local and temporary. If local persistence is implemented, explain and provide **Clear conversation**. Never suggest cross-device history or account storage when none exists.

### Landing page specification

1. **Minimal header:** wordmark left; a small “Capabilities” anchor and primary **Open assistant** action right. On mobile, retain the CTA visibly without a crowded menu.
2. **Hero:** one high-impact statement, one sentence explaining the product, interactive or visual orb, clear primary CTA, secondary **Explore capabilities**. At first paint, the message and CTA must be readable before 3D loads. Example direction: italic “A new way to” + display “THINK OUT LOUD.” Use as exploratory copy only.
3. **Proof strip:** three short outcomes, such as “Speak naturally,” “See what matters,” “Make something useful.” Each links to a relevant app starter, not a separate page.
4. **Capabilities chapter:** voice, vision, workspace, research, studio, coach, and lab. Present as a concise editorial grid or stepped sequence. For each: one practical user outcome, one credible sample prompt/action, and availability state. Avoid seven giant promotional cards.
5. **Product-in-use chapter:** one real or representative app screen showing a question, a grounded answer, a cited source or image interpretation, and the voice control. Label samples as examples when they are not live output.
6. **Trust and limits:** explain permission requests, public demo limits, source attribution, and ephemeral data in plain language. Link to a compact details panel/section as needed.
7. **Closing invitation and footer:** a final one-line CTA to `/app`; footer with maker credit, project status, accessibility/feedback links, and legal/privacy links only when those destinations exist.

The landing should feel like an editorial experience, yet remain useful if scripts, WebGL, or animation do not run. Avoid autoplay sound, mandatory scroll-jacking, and long intro loaders.

### Chat app specification

**Desktop layout:** compact top bar; optional narrow mode rail on the left; central conversation/work area; optional contextual detail panel on the right for sources, image inspection, or workspace artifacts. The app must not resemble a generic chat clone. The orb sits near the voice entry/status region and can become a compact header signal once a conversation begins. Keep transcript and composer visually dominant.

**Mobile layout:** single column; compact top bar; conversation; composer anchored safely above the virtual keyboard; mode picker as a bottom sheet or horizontally scrollable control; detail panel opens as a sheet. The orb scales down and never displaces the newest answer.

**Empty state:** one concise welcome line, input composer, microphone button, image attachment button, and 3–4 starter prompts spanning the major capabilities. “Try voice” can be prominent, but text must be equally easy to use. Show language selector and permission explanation before the first voice request.

**Active conversation:** clearly distinguish visitor and assistant turns. Show timestamps only when useful. Assistant responses support readable headings, lists, code when needed, sources with a clear click target, and copy/export controls. Streaming output must not constantly shift the page under the user's cursor or keyboard focus. Keep scroll position if the visitor reads earlier content; provide a “Latest answer” button.

**Modes:** a single stable mode control, with clear names and one-line descriptions. `Voice` is an input/output path; `Vision` handles image questions; `Workspace` organizes artifacts; `Research` shows evidence; `Studio` creates; `Coach` guides; `Lab` exposes experimental tools. Modes can share the same conversation view. Show unavailable modes honestly with a reason; never simulate a provider result as if it were live.

**Composer:** multiline text, Send, Attach image, Voice, mode indicator, and Stop while generating. Enter sends; Shift+Enter adds a line; these rules must be visible in help text and adjustable if accessibility testing calls for it. Disable only the action that cannot run and explain why. For a public demo, show concise limits before users hit them.

**Voice flow:** idle → permission request → listening → transcribing/thinking → speaking → idle. Provide Stop listening and Mute/Stop speaking. Show live or partial transcript if supported, with the ability to edit before sending when appropriate. Do not imply the microphone is off solely because the orb changes color; display an explicit status and browser permission state.

**Image flow:** attach by file picker (and paste/drag-drop where supported), preview with filename and remove action, clear consent cue before upload, visible progress, concise failure recovery, and an accessible description of what will be sent. The output distinguishes observed image details from inference.

**Research flow:** show retrieval progress, clickable source titles, publication/source context where available, and citations adjacent to claims. Mark unsourced answers or unavailable retrieval candidly. A source drawer must be keyboard reachable and dismissible.

**Workspace/Studio/Coach/Lab:** use one common work surface and adaptable detail views. Workspace exposes saved in-session items and exports; Studio shows generated drafts/artifacts and revisions; Coach provides goals, next steps, and session progress; Lab labels experiments and their limits. These features should expand the core conversation rather than produce seven unrelated apps.

**System states:** design loading, empty, permission denied, offline, provider error, rate limit, unsupported browser, upload failure, no sources, and recovery. Every error should say what happened and give one useful next action. Preserve the visitor's unsent draft through recoverable failures.

## 6. Orb behavior and motion language

The orb is a **stateful signal object**, not the only source of truth. Treat it as one component used at two scales: hero artifact and app indicator. Its state machine is driven by actual app state, never by a timed demo loop in the live chat.

| State | Visual behavior | Required companion text |
| --- | --- | --- |
| Idle | Slow internal refraction; nearly still outer silhouette | “Ready” / “Ask anything” |
| Hover/focus on voice | Slightly brighter rim and a small orbit response | “Start voice” |
| Requesting permission | Pause motion; narrow halo | “Allow microphone access to speak” |
| Listening | Gentle radial breathing and cyan interior response to input level | “Listening”; visible Stop control |
| Processing | Inner filaments converge, restrained lilac rotation | “Thinking” or “Transcribing” |
| Speaking | Low-amplitude rose/lilac pulse tied to output level if available | “Speaking”; visible Stop speaking |
| Paused/muted | Static dimmed surface; no waveform | “Paused” / “Muted” |
| Success | One brief soft expansion, then idle | Completion message near relevant output |
| Error/offline | Motion stops; warm rim, no aggressive shake | Specific error and retry action |

**Motion budget:** interaction feedback 120–220 ms; panel/open transition 220–360 ms; landing reveal 500–800 ms; no prolonged blocking entrance. One major animated subject per viewport. Favor opacity and transform for UI movement; avoid animating layout-heavy properties in dense chat. GSAP-like sequencing may be used for the landing, but the resulting UX is the requirement, not the library. In a React implementation, animations must be scoped and cleaned up when views unmount. [GSAP documents context-based cleanup](https://gsap.com/docs/v3/GSAP/gsap.context%28%29/).

**Page transition:** a short fade/scale handoff can connect the landing orb to the app voice indicator where supported. Navigation and focus must still work without the effect. The [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) is an optional progressive enhancement, not a dependency.

**Reduced motion and fallback:** honor `prefers-reduced-motion` by removing continuous rotation, parallax, scaling, and entrance choreography; retain instant status changes and a static orb image. Provide a visible “Reduce motion” option in the app if feasible. If WebGL is unsupported, loses context, or performs poorly, show a high-quality static image/CSS fallback without losing any function. Pause the render loop when the tab is hidden or the orb is offscreen. See [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) and [WebGL context loss](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event).

## 7. Components and content rules

| Component | Required treatment |
| --- | --- |
| Primary CTA | High-contrast filled button; verb-led label; visible hover, focus, loading, and disabled states. |
| Secondary action | Text or outlined button; never competes with primary CTA. |
| Mode picker | One active mode; clear label and description; keyboard selectable; availability shown. |
| Voice control | Icon plus accessible name and explicit recording state; no ambiguous glowing-only feedback. |
| Composer | Calm opaque panel with generous tap targets and an obvious Send action. |
| Message | Distinct speaker hierarchy; comfortable line length; copy action; semantic content structure. |
| Source item | Human-readable title and domain; opens predictably; source availability stated. |
| Artifact card | Clear type, title, creation state, preview, and save/export action. |
| Toast/status | Short, specific, dismissible when persistent; never the sole report of an important failure. |
| Permission panel | Why access is needed, what will be transmitted, and an explicit Continue/Cancel choice. |

**Writing standards:** show outcomes rather than capability hype. Use real sample prompts, e.g. “Summarize this chart in Filipino” or “Compare two sources and tell me what they disagree on.” Use sentence case for UI labels. Use title case sparingly in campaign headlines. Avoid fabricated testimonials, fake counters, and claims that every answer is verified. Make sample data visibly sample data.

## 8. Accessibility, language, and responsive requirements

- Target **WCAG 2.2 AA**. Text contrast at least 4.5:1 for normal text and 3:1 for large text; interactive boundaries and indicators at least 3:1 where applicable. Verify actual rendered combinations, including translucent overlays. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- Every function works with keyboard alone. Provide skip link, semantic landmarks, ordered headings, visible focus, no focus trap, Escape to close overlays, and focus return to the invoking control. Aim for a 2 px focus ring with strong contrast. Do not hide focused elements under the fixed composer.
- Touch targets should be at least 44 × 44 CSS px by design; this exceeds the [WCAG 2.2 AA minimum of 24 × 24 px](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) and better suits mobile use.
- Screen readers receive concise status announcements for listening, processing, completion, and errors. Avoid announcing every streamed token. Transcripts, controls, and sources remain available without canvas/WebGL.
- Never autoplay audio. Provide captions/transcripts for all spoken output. Support microphone refusal with an immediate text path.
- Support zoom to 200% and reflow at 320 CSS px without lost content, horizontal page scroll, clipped controls, or hidden actions. Test landscape phones, narrow desktop windows, and virtual keyboards.
- English and Filipino UI strings must fit without truncating important instructions. Respect `lang` on content, especially where answer language differs from interface language. Preserve code-switching in user input and transcripts.
- Mobile bottom sheets need clear drag-independent controls. Do not require hover, gesture-only controls, or precision interaction.

## 9. Performance and implementation rules

- The landing's first meaningful content is HTML text and a working CTA. Lazy-load 3D and nonessential media after those essentials are available.
- Build the orb as a progressively enhanced visual component with a static poster fallback. Cap device pixel ratio/render complexity; prefer a single render context. Stop work while hidden and recover from context loss. Follow [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).
- Measure real-user Core Web Vitals where possible. Aim for [LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile](https://web.dev/articles/vitals/) on both routes. Do not claim a pass based on one desktop lab run.
- Avoid large font payloads, layout shifts from late font swaps, oversized hero video, and continuous animations competing with the chat stream. Use media and font subsetting where license permits.
- API keys, including ElevenLabs or model-provider secrets, stay server-side. Public access requires quotas, rate limits, and visible exhaustion states. Do not show a disabled feature as functional. This requirement affects interface honesty as well as deployment.
- Do not persist microphone audio, images, transcripts, or conversations longer than the product truly needs without clear disclosure and controls. Respect browser permission revocation and page lifecycle.
- Keep design tokens centralized; derive component states from semantic tokens rather than scattered one-off colors. Implement all core controls as semantic HTML before adding motion.

## 10. Codex build guardrails

1. Use this file as the design contract. Before implementation, reconcile any conflict with the current product spec and record the chosen behavior.
2. Build the two routes and functional text path first, then voice/vision and advanced modes, then visual polish. The orb must never block core interaction.
3. Keep one coherent brand across landing and app: shared wordmark, tokens, type roles, orb material, and motion timing.
4. Make a clear distinction between **live**, **demo/sample**, **unavailable**, and **experimental** features. No fabricated citations, test results, generated content, or provider connections.
5. Use original assets and code. The reference is direction for rhythm and quality, not a template. Avoid copying its layout or hero artwork.
6. Define and implement empty, loading, success, denied, error, offline, and rate-limit states for every enabled input path.
7. Test the actual browser layout and keyboard path at desktop, tablet, and mobile sizes. Inspect both reduced-motion and no-WebGL fallbacks.
8. Validate contrast on rendered pages, not just token pairs. Validate that the 3D canvas and motion do not impede voice, reading, or focus.
9. Do not add login, auth, a dashboard route, or multiple disconnected apps. New complexity requires a demonstrable improvement to this two-page experience.
10. Do not silently change the placeholder name into a final brand. Naming requires a separate decision.

## 11. Acceptance criteria

The design implementation is ready for portfolio review when all are true:

- `/` and `/app` load directly and link to each other; the app is usable without signup.
- The landing communicates what the assistant does and offers a working CTA without waiting for the orb.
- The app supports a complete text conversation and visibly represents the actual availability of voice, vision, workspace, research, studio, coach, and lab.
- Orb states match actual input/output states, with textual equivalents and full control paths.
- A visitor can allow/deny microphone access, stop recording/playback, attach/remove an image, recover from errors, and continue by text.
- Research results distinguish cited evidence from uncited model output.
- The design is original relative to the supplied reference while retaining the requested cinematic-black editorial tone.
- Keyboard navigation, focus order, screen-reader statuses, reduced motion, text zoom, 320 px reflow, and color contrast are tested and corrected.
- Mobile composer and overlays remain usable with the virtual keyboard open.
- A static/no-WebGL fallback preserves the product's identity and every core function.
- Public demo limits, privacy behavior, and sample/experimental states are expressed honestly in the interface.
- Visual review finds consistent typography, spacing, stroke, icon, motion, and copy across both pages; no default-template sections or decorative clutter.

## 12. Design handoff checklist

Deliver during implementation: wordmark and one-color mark; font license record; CSS token file; desktop/tablet/mobile views of both routes; orb poster and 3D source; documented orb state map; English/Filipino UI string table; component states; reduced-motion and no-WebGL captures; accessibility review; actual performance measurements; source/privacy disclosure copy.

## Reference notes

- Visual reference: [Arkon Digital](https://arkon.digital/) and the screenshot supplied with the project. Observations in §2 describe the supplied reference; all product recommendations are original design decisions.
- Accessibility requirements: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [WAI's WCAG 2.2 summary](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).
- Motion and rendering: [MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion), [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).
- Performance: [web.dev Core Web Vitals](https://web.dev/articles/vitals/).

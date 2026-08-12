# Product

## Register

brand

## Users

Weitblick financial advisors presenting live to clients — on a large screen in a meeting room or shared via video call. The audience are advisory clients (retail investors) watching, not operating: the advisor speaks and taps, the presentation shows. The client's job-to-be-done is to *believe* the selection process: understand that the whole German market was considered and systematically filtered down to a recommendation.

## Product Purpose

A self-contained, tap-driven presentation animation ("Best Select") that dramatizes Weitblick's selection process: the full market (Sparkassen, Versicherer, Fonds/ETFs) appears across a night map of Germany, then a Weitblick-branded radar sweep filters it down to the best few. Success = the client feels the scale of the market and the rigor of the filter without a single spreadsheet being shown. One HTML file, no build step, works offline-ish (CDN fonts/motion degrade gracefully), German language.

## Brand Personality

Authoritative, premium-editorial, calm confidence. "High-end broadsheet" clarity — the stage shows, the advisor speaks. Evokes trust in the rigor of the process, never fintech flash or sales pressure. Restraint in copy (headlines only, no bullet walls), drama carried by choreography and light.

## Anti-references

- Fintech dashboard clichés: KPI tiles, gradient CTAs, hero-metric templates.
- PowerPoint energy: bullet lists, clip-art, per-slide transitions with no narrative continuity.
- Casino/crypto glow: oversaturated neon, particle spam, bouncing easing.
- Anything that looks like an ad rather than an argument.

## Design Principles

1. **The stage shows, the advisor speaks** — visuals carry evidence (counts, density, filtering), copy stays to a kicker + headline; the spoken word does the persuading.
2. **One continuous scene, not slides** — every step transforms the same stage; objects persist and move rather than being replaced.
3. **Scale then rigor** — first make the market feel overwhelming (density, counters), then make the filter feel inevitable (one sweep, few winners).
4. **Choreographed, deterministic, repeatable** — the presentation must play identically every run and survive back-navigation; no randomness the presenter can't rehearse against.
5. **Premium restraint** — Abyssal/Azure blue palette, glass used sparingly and purposefully, characterful grotesk + humanist sans pairing: Selecta (licensed, installed on the presentation machine; Schibsted Grotesk is the designed self-hosted fallback) for headlines, Inter for instrument text.

## Accessibility & Inclusion

- Full `prefers-reduced-motion` support: every step resolves instantly to its end state.
- Screen-reader narrative via `aria-live` rail + per-step evidence text; decorative layers `aria-hidden`.
- Keyboard operable (arrows/space/enter back-forward), forced-colors fallbacks.
- Browser zoom must genuinely enlarge the stage (no zoom-defeating rescale).

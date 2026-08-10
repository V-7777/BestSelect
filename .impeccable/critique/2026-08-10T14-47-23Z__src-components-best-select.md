---
target: src/components/best-select
total_score: 30
p0_count: 0
p1_count: 2
timestamp: 2026-08-10T14-47-23Z
slug: src-components-best-select
---
Method: dual-agent (A: design-review sub-agent · B: detector/browser sub-agent)

# Critique — Best Select presentation (`src/components/best-select`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Swallowed clicks during input locks still play the hint pill's press animation — false "accepted" feedback |
| 2 | Match System / Real World | 4 | Germany map, real market counts, radar metaphor coherent; idiomatic German |
| 3 | User Control and Freedom | 3 | ~5s radar lock unskippable; no pause for live Q&A |
| 4 | Consistency and Standards | 4 | Bezel/glass motif rigorously consistent card → badge → hub → pills |
| 5 | Error Prevention | 2 | Any click on step 10 restarts the show — a stray tap wipes the finale live |
| 6 | Recognition Rather Than Recall | 4 | Persistent 8-row legend (glyph+label+number); client never memorizes |
| 7 | Flexibility and Efficiency | 3 | Keyboard, ?step=N&play rehearsal links, debug overlay — but undiscoverable |
| 8 | Aesthetic and Minimalist Design | 3 | Empty glass slab at steps 1–4; pre-lit backdrop competes with signal layer |
| 9 | Error Recovery | 2 | Accidental restart unrecoverable in the moment; press feedback lies during locks |
| 10 | Help and Documentation | 2 | Rehearsal features live only in code comments; first-run advisor discovers nothing |
| **Total** | | **30/40** | **Good — solid foundation, address weak areas** |

## Anti-Patterns Verdict

**Not AI slop.** Authored craft is dense: phase-locked radar choreography (per-icon ping keyed to beam angle, winner color-flip hidden in the invisible opacity window), a "milled bezel" double-rim motif repeated at every scale, seeded deterministic placement, native German microcopy. The "Schritt 01 · …" kicker is a literal numbered sequence — earned, not scaffolding.

Two caveats where the most-seen pixels are the least distinctive: the `germany-night.png` backdrop is a glowing-network texture that itself reads AI-generated/fintech-ad; and the headline in practice renders in Open Sans 600 (Selecta is license-gated and effectively never installed), a commodity voice on a brand surface that contradicts PRODUCT.md's promised editorial pairing.

**Deterministic scan (source)**: 0 findings across src/components/best-select, src/lib/best-select, and all of src/ — genuinely clean, no suppressions.

**In-page detector (headless injection at steps 0/8/10)**: 65–69 hits per view, dominated by ai-color-palette (~56, the icon tiles' cyan-on-dark) and dark-glow (5–13, radar arm/ring/hub + winner halos) — these target the committed, documented Abyssal/Azure night aesthetic and are judged false positives for this brand. Both low-contrast hits are text-on-itself sampling artifacts (1.0:1 against transparent backgrounds). Real residue: 1 eyebrow chip (the kicker — earned, see above), 1 all-caps hint label (short label, acceptable), 1 nested-cards hit on the counter's outer shell + core (the documented bezel motif, intentional). Note: browser was headless — no user-visible overlay tab exists; evidence is console + screenshots only.

## Overall Impression

A genuinely crafted presentation with one excellent peak (the radar sweep) and a disciplined material system — undermined by a middle that sags (steps 5–7 are three interchangeable reveals), an ending that is a caption swap instead of a finale, and an empty glass slab where the premium counter card should be growing. The single biggest opportunity: make step 10 the emotional peak the peak-end rule demands — right now the client's last impression is the weakest frame in the deck.

## What's Working

1. **The radar sweep is presentation-grade motion engineering** — per-icon phase-locked ping/afterglow/winner-flip, compositor-only, deterministic and rehearsable.
2. **A material system, not assembled parts** — the double-rim bezel recurs at every scale (364px card → 38px badge → 64px hub), so the stage feels made of one substance.
3. **Rehearsal-first engineering** — seeded placement, ?step=N&play deep links, clean back-nav to result states, verified reduced-motion end states.

## Priority Issues

1. **[P1] Empty counter card at steps 1–4** — full 8-row-height glass from step 1; early steps show a large blank slab that reads as a loading failure. **Fix**: grow the card with its rows so the ledger visibly accumulates (strengthens the scale narrative too). Suggested: /impeccable polish
2. **[P1] Step 10 is not a finale** — visually identical to step 9's settled state; caption-only change, and the trust-critical anonymization line is 12px at 48% alpha. **Fix**: one consolidation gesture (stage dims, 8 winners own the light, "8 aus über 14.000" stated once) + legible reassurance line. Suggested: /impeccable animate
3. **[P2] Accidental restart on the final step** — any click on step 10 fades and restarts; unrecoverable mid-conversation. **Fix**: make stage clicks inert on step 10; restart only via the pill. Suggested: /impeccable harden
4. **[P2] 8 category colors are not mutually distinguishable** — ecru/cream/lavender cluster and three near-identical blues; 12px glyphs do the real work and smear on screenshare compression. **Fix**: re-space the eight hues into clearly separated families. Suggested: /impeccable colorize
5. **[P2] The shipped headline face is Open Sans** — the license-gated Selecta-first stack means the brand voice defaults to a commodity sans. **Fix**: bundle the licensed display face as WOFF2 (or commit to a deliberate alternative). Suggested: /impeccable typeset

## Persona Red Flags

**Alex (the presenting advisor)**: 5.05s unskippable radar lock — no pause when the client interjects; swallowed clicks still animate the pill press (trains re-clicking); step-10 any-click restart is a live-demo landmine.

**Jordan (the watching client)**: steps 5–7 are three visually interchangeable reveals exactly where the numbers get big; decodes 12px glyphs through screenshare compression because the color channel fails.

**Sam (accessibility-dependent)**: no focusable control anywhere (div onClick + document key handler, no button role, no focus indicator) — keyboard works but is invisible; .note text at 48% alpha fails AA. Positives: real aria-live evidence rail, lang="de", working reduced-motion, genuine zoom support.

## Minor Observations

- Pre-lit backdrop blazes at step 0 — density narrative loses headroom; category reveals compete with the map's own light.
- "00 / 10" is an awkward zero-state for the progress counter.
- The total market (~14.200) is never stated — the sum is the punchline of steps 1–8 and nobody says it.
- Stale comment: lockFor claims the radar "may be left early" but the lock covers the full sweep.
- Counter card dimming to opacity .55 at steps 9–10 drops row labels below AA.
- Dev-only Next.js badge visible bottom-left — confirm absence in the production build.

## Questions to Consider

1. What if the market lit the map? Backdrop starts near-dark, each category raises the ambient glow — step 8 becomes a country at full blaze, and the radar's clearing feels like a decision.
2. Is anonymity being dramatized (confident withholding — winners flip face-down) or merely disclaimed in the quietest text on screen?
3. If the presentation laptop never has Selecta installed — and it won't — is Open Sans the voice Weitblick chose, or the one it defaulted into?

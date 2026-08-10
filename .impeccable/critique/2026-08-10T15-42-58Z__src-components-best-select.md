---
target: src/components/best-select
total_score: 33
p0_count: 0
p1_count: 2
timestamp: 2026-08-10T15-42-58Z
slug: src-components-best-select
---
Method: dual-agent (A: design-review sub-agent · B: detector/browser sub-agent)

# Critique — Best Select presentation (`src/components/best-select`) — run 2

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Swallowed-click acknowledgment (pill dims to 0.6) is subtle for a nervous presenter |
| 2 | Match System / Real World | 4 | Plain German, honest metaphors; "Jede Bausparkasse im Blick" over 4 symbolic badges is the quibble |
| 3 | User Control and Freedom | 4 | Back-nav, Esc-settle, restart all verified working |
| 4 | Consistency and Standards | 4 | One instrument system; &play rehearsal mechanics diverge from live (see P2) |
| 5 | Error Prevention | 3 | Locks + inert finale excellent; &play never locks; F5 loses position |
| 6 | Recognition Rather Than Recall | 3 | Legend mirrors badges 1:1; advisor must memorize all shortcuts, no next-step preview |
| 7 | Flexibility and Efficiency | 4 | Full keyboard nav, Esc-settle, rehearsal deep links, debug overlay |
| 8 | Aesthetic and Minimalist Design | 3 | Pre-lit plexus map blunts the empty→full arc; raw-market ledger lingers at finale |
| 9 | Error Recovery | 3 | Any state recoverable in one keystroke; refresh recovery is manual |
| 10 | Help and Documentation | 2 | Esc-settle and shortcuts — the features an advisor needs mid-meeting — are undiscoverable |
| **Total** | | **33/40** | **Good (up from 30)** |

## Anti-Patterns Verdict

**Not AI slop — clear pass.** The radar choreography (geometry-derived per-icon ping delays, clockwise winner flips behind the beam, compositor-only embers) is bespoke craft; the glass instrument system is coherent and sanctioned; the numbered kicker is the legitimate case (a literal 10-step sequence); the headline now renders in Schibsted Grotesk — a characterful, non-reflex face. Two residual tells, both known: the stock plexus-mesh map asset, and the navy-glow fintech palette the night-map concept partly requires.

**Deterministic scan**: src/app clean; src/components/best-select has exactly 1 finding — the `layout-transition` on the counter card's growing plate, the user-approved intentional effect. In-page detector: ~111 hits/view, ~95% the committed palette/glow counted per element (false positives for this brand); both low-contrast hits are text-on-itself sampling artifacts (1.0:1, identical hex both sides); residue is the earned kicker chip, the uppercase hint label, and the documented bezel nesting. Headless browser — no user-visible overlay tab; evidence is console + screenshots.

## Overall Impression

The two P1s from run 1 that were addressed are visibly resolved: the ledger now grows row by row (cited as a strength this time), and the finale is click-safe. What remains is the deferred finale story — and fresh probing found the argument's soft opening (38 claimed, 4 badges shown, disclaimer only at step 8) plus two real operator bugs: rehearsal mode (&play) bypasses the input lock, and a mid-meeting refresh silently loses the presentation position.

## What's Working

1. **The radar choreography is real craft** — deterministic, rehearsable, Esc-settles to the exact end state, reduced-motion resolves instantly (all verified).
2. **Engineered for the meeting**: per-beat input locks, Esc-settle for interruptions, inert finale stage (stray click verified harmless), honest press feedback that only fires when a click will be accepted.
3. **Honest evidence system**: the accumulating glass ledger, de-DE count-ups, legend tiles mirroring map badges, parallel aria-live narrative.

## Priority Issues

1. **[P1] The finale's payoff is never shown** — step 10 is pixel-identical to settled step 9; "acht Empfehlungen aus ~14.200" exists only in screenreader text; the ledger still shows the raw market at 0.72 opacity under "Das Beste bleibt". *(User plan: finale rework with the Assets.html head-to-head — deferred.)* Suggested: /impeccable shape (when ready)
2. **[P1] Early steps undercut the "every provider" claim** — headline says "Jede Bausparkasse", counter says 38, map shows 4 badges; the symbolic-compression note arrives only at step 8. Fix: surface a one-line symbolic note from step 1, or render the two small categories 1:1. Suggested: /impeccable clarify
3. **[P2] Rehearsal mode differs from live mode** — the ?step=N&play path never calls lock(): clicks advance mid-choreography and Esc does nothing (verified). Advisors rehearse against wrong mechanics. Fix: lock(lockFor(step,1)) on &play. Suggested: /impeccable harden
4. **[P2] Mid-meeting refresh loses position** — URL never tracks the step; F5 at step 7 returns to title. Fix: history.replaceState ?step= on every advance. Suggested: /impeccable harden
5. **[P3] Blue-family colors cluster under compression** — azure/cyan/ice-blue/cream are hue-neighbors on projector-grade compression; glyph shapes save it. Fix: rotate cyan toward teal or deepen fonds toward periwinkle; verify at 50% JPEG. Suggested: /impeccable colorize

## Persona Red Flags

**Alex (advisor)**: Esc-settle and keyboard nav are invisible features learned only from source; no next-step preview; the 5s radar lock can only be pre-empted by an untaught Esc-then-click.

**Jordan (watching client)**: can count 4 icons against "38" at the first evidence moment; never sees the "8" he should walk away with; steps 5–7 are three near-identical beats to disengage in.

**Riley (stress-tester)**: &play accepts mid-animation clicks and ignores Esc (verified); refresh discards position. Everything else survived probing: locks swallow double-clicks, back-nav is deterministic, restart is clean, finale clicks inert.

## Minor Observations

- Counter card at 0.72 opacity sits exactly at the AA floor for its 11px labels — no margin.
- Design.md still describes a light dashboard system and PRODUCT.md promises "DM Serif Display + Inter" — the docs no longer describe the shipped product (/impeccable document would sync them).
- The text rail is fully invisible ~0.5–1s during each transition; combined with the 8s fonds cascade the stage is briefly headline-less.
- Step 0's map is pre-lit at maximum — icons add density but light never grows.
- Dev-only Next badge in dev screenshots; confirmed absent in production build (run 1).

## Questions to Consider

1. ≈14.200 providers considered appears nowhere — what if the finale said "Aus 14.218: acht"? The whole arc in one repeatable line.
2. What if the map started dark and each step lit its region — light as evidence, and the sweep visibly extinguishing it?
3. Does step 10 deserve a separate click if nothing changes on stage — or should the sweep land directly in the finale?
4. Selecta will be installed on almost no machine — should Schibsted Grotesk simply be the brand face, so every advisor shows the same headline?

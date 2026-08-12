---
target: src/components/best-select
total_score: 34
p0_count: 0
p1_count: 2
timestamp: 2026-08-11T19-25-46Z
slug: src-components-best-select
---
Method: dual-agent (A: design-review sub-agent · B: detector/browser sub-agent)

# Critique — Best Select presentation (`src/components/best-select`) — run 3

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | During 5.5–8s choreographies a swallowed click gives no feedback beyond the subtle hint-pill dim |
| 2 | Match System / Real World | 4 | Idiomatic, calm German copy; radar/funnel metaphors self-evident |
| 3 | User Control and Freedom | 4 | Back-nav, Esc-settle, restart, deep links, refresh-restore all verified working |
| 4 | Consistency and Standards | 3 | Visual system airtight; behavioral gap: locks cover choreography on steps 1–12 but not 13/14/16, contradicting `lockFor`'s own contract |
| 5 | Error Prevention | 3 | Inert finale stage + input locks excellent, but the lock gaps let a double-tap amputate beats |
| 6 | Recognition Rather Than Recall | 4 | Legend tiles mirror map badges exactly (color, edge, glyph); criteria stay printed on the funnel |
| 7 | Flexibility and Efficiency | 3 | Full keyboard set + rehearsal deep links; no in-UI step jump; Esc-settle undiscoverable |
| 8 | Aesthetic and Minimalist Design | 4 | Every element argues; copy stays kicker+headline; per-step scrim tuning |
| 9 | Error Recovery | 3 | Any state recoverable; no fallback if `germany-night.png` fails to load |
| 10 | Help and Documentation | 3 | Hint pill is contextual instruction; no presenter-facing shortcut reference |
| **Total** | | **34/40** | **Good (up from 33)** |

## Anti-Patterns Verdict

**Not AI slop — clear pass.** The reviewer's verdict: viewers would ask "how was this made?", not "which AI made this?". The night-map + radar + dimensional glass funnel machine is bespoke, committed work. Ban-list clean: no side-stripes, no gradient text, no hero-metric template, no overflow. Glass is the sanctioned instrument system (consistent double-rim treatment across counter card, pills, hub — a system, not decoration). Step 14's 3×3 card grid is data-motivated (3 providers × 3 tariffs). Two honest asterisks: tracked-uppercase micro-text is the *only* label grammar on the surface (kicker, counter labels, hint, criteria, finale tag) — coherent instrumentation, but the one lean on a training-data default; and Inter is a reflex-reject face, committed in Design.md so identity-preservation wins.

**Deterministic scan**: CLI exit 2 with exactly **1 finding** — `layout-transition` (`transition: height`, best-select.css:146, the counter card's growing plate; previously user-approved as intentional). In-page detector across 6 views of the 16-step deck: ~131–134 hits/view, of which ~126 are two rules (`ai-color-palette`, `dark-glow`) firing once per decorative map icon — the committed palette counted per element, not independent issues. Both `low-contrast` hits are sampling artifacts (1.0:1 with identical hex on both sides; elements clearly legible in screenshots). Residue matches the known set: the earned kicker chip (`hero-eyebrow-chip`), the uppercase hint label (`all-caps-body`), documented bezel nesting (`nested-cards` on `div.core`), `overused-font` (Inter 87–89%), `monotonous-spacing` (~4px 99%). Detector and reviewer agree the surface is clean; the detector surfaced nothing the reviewer missed.

**Visual overlays**: headless session — no user-visible overlay tab; evidence is injected-console output + 39 screenshots across two browser runs.

## Overall Impression

The funnel act has landed. Run 2's top P1 ("the finale's payoff is never shown") is resolved emphatically: the deck is now 16 steps, the two-exam funnel (Unternehmen → Tarife) is legible and charismatic, and the finale rises "Unternehmen B · Premium" to center with a five-check cascade — verified frame by frame. Both run-2 P2 operator bugs are also gone: mid-presentation refresh restores the exact step, and rehearsal deep links behave. What's new: the choreography has outgrown its input locks. The newest, longest beats (funnel phases and the finale itself) release input seconds before their choreography completes — the finale can be accidentally *restarted* by a rhythm-keeping presenter tap 3 seconds into a 7.7-second crescendo. The single biggest opportunity is narrative, not visual: the 3.4M-Unternehmen number — the largest in the dataset — is never spoken, while the funnel act is framed entirely around "Unternehmen".

## What's Working

1. **The choreography state machine survives a real meeting — verified, not assumed.** Esc mid-choreography settles to the exact deterministic end state; F5 at step 13 restores identically; back-nav from finale renders clean result-states; reduced-motion resolves every step including the finale instantly; `?step=999` clamps; the finale stage is click-inert.
2. **The legend-to-map channel**: `.cico` legend tiles are literal miniatures of the map badges (same face, edge, category color at 20px vs 38px), making the counter card self-explanatory — nine hue families chosen to survive screenshare compression, with glyph+label as the color-independent channel.
3. **Micro-narrative typography**: in the "… im Blick" lockup only the changing word animates while "im Blick" literally stands still (TextRail.tsx partial swap, verified across steps 1→7) — premium-restraint motion design.

## Priority Issues

1. **[P1] Lock gaps let input amputate or destroy narrative beats** — `lockFor` (BestSelect.tsx:33–47) returns 700ms for funnel phases 3/4 (~2.7–3s of choreography; a rapid advance verifiably cuts the head-row glide mid-flight), 2600ms for phase 5 (~11s), and 2900ms for the finale (~7.7s) — where the next keyboard advance is a full **restart of the show**. Contradicts the file's own comment ("ein zweiter Klick kann keinen Erzählmoment amputieren"). Fix: raise `f===3`→~2800, `f===4`→~3100, `f===6`→~7600 (Esc stays the deliberate skip), or gate keyboard-restart at the finale behind a settle. Suggested: /impeccable harden
2. **[P1] The 3.4M Unternehmen — the biggest number in the dataset — is never stated.** The `unt` category is winnerOnly (constants.ts:37): no step, no counter row, yet its rose badge appears as a ninth winner in the sweep uncredited, and the whole funnel act is framed as "Unternehmen". One evidence beat ("3.400.000 Unternehmen", even as a sub-line at step 9 or 11) closes the hole and adds the most impressive scale number in the show. Suggested: /impeccable clarify
3. **[P2] Step 15's argument is invisible at presentation pace.** The criteria ladder lights from 5.0s to ~11s (FunnelStage.tsx:164 + `--i * 1.3s` CSS delays) but the lock releases at 2.6s — at natural advancing pace "Derselbe Maßstab" (the rigor thesis restated) never shows. Verified: at 5.2s only 1 of 5 criteria is lit. Fix: start the ladder as the intake lands (~4.5s) with ~0.6s stagger, or hold the lock until it completes. Suggested: /impeccable animate
4. **[P2] Multi-monitor DPI shift breaks the fit heuristic.** `fit()` (BestSelect.tsx:170–195) treats any devicePixelRatio change as browser zoom; dragging from a 2× laptop to a 1× projector — the exact Weitblick scenario — mis-scales the stage mid-meeting. Fix: re-baseline on screen change or use `visualViewport.scale`. Suggested: /impeccable harden
5. **[P3] Spec/build divergence + spout artifact.** PRODUCT.md promises DM Serif Display; the build ships Selecta/Schibsted Grotesk (the stronger choice — update the spec, not the build). The light column under the funnel spout shows hard rectangle edges against the map (`#fBeam` + spout bands) — soften with a horizontal fade mask. Suggested: /impeccable polish

## Persona Red Flags

**Alex (presenting advisor)**: Enter/space at the finale restarts the presentation after only 2.9s — a rhythm-keeping tap destroys the closing moment (keyboard `go(step+1)` → `n > LAST` restart path, BestSelect.tsx:71). No in-UI jump when a client asks "show the funnel again" — only arrow-stepping up to 16 beats or hand-editing `?step=`. Esc-settle remains undiscoverable outside the source.

**Jordan (watching client)**: The rose "org" badge appears during the sweep from a category never introduced — the one moment the show asks the viewer to accept something unexplained. The two-exam pivot (company → tariff criteria) rides on the 10px tracked kicker — the smallest text on the surface carries the largest structural transition, and the criteria swap happens while the funnel is parked off-frame. "Klicken für den nächsten Schritt" addresses the wrong person on a screenshare.

**Riley (stress tester)**: Verified clean — refresh mid-flow, deep-link + `&play`, back-nav from finale, Esc-then-advance, `?step=999` clamp, finale stage-click inert. Verified breakable — double-advance at steps 13/14 (700ms lock) cuts glides mid-flight; settles correctly afterward but looks broken while it happens. Code-evident, unexercised — DPI mis-scale; missing `germany-night.png` leaves a bare gradient with floating badges.

## Minor Observations

- Cognitive load: 1 checklist failure (chunking — counter card grows to 8 rows; mitigated by one-row-per-step reveal and evidence-not-menu role). Viewer makes zero decisions; no decision point exceeds 4 options.
- Dev-only Next.js badge sits bottom-left in every screenshot — run a production build on the presentation machine.
- Unlit funnel criteria (rgba(215,226,255,.55) at 13px uppercase) hover near the AA floor; acceptable as pre-state, transitioning to .95 when lit.
- Placement culls the three hub-farthest Versicherer icons for composition while the counter keeps the true 522 (placement.ts:97–106) — defensible, but a quiet picture-vs-number divergence in a show about honesty of evidence.
- `aria-live` rail + per-step `evidenceFor()` narration with all visual layers `aria-hidden` is a genuinely considered SR strategy; forced-colors block exists; noscript covered.
- Counter card dims to 0.78 during the radar with an explicit AA-contrast comment (CounterCard.tsx:23–25).

## Questions to Consider

1. The radar filters the whole market with unnamed criteria at step 9; the funnel then names five criteria — twice. Is the radar one instrument and the funnel another, or should the client understand them as the same rigor? Right now the show implies two different machines.
2. Steps 1–7 are seven repetitions of the same beat. Would 3–4 accumulating beats (grouping small categories) make the market feel *bigger* while protecting meeting time for the funnel act — the newer, stronger material?
3. The peak-end crowns "Unternehmen B · Premium" — an anonymous letter. Does the emotional payoff survive the anonymization, or should the finale hand off explicitly to the advisor ("die Namen nennen wir jetzt") as the scripted final line?

# Design — Hum (Bubble · guided sourdough)

Locked design system, seeded from a Hallmark study of
`https://www.usehallmark.com/examples/hum-07/` (Hum theme, hum-07).
Future Hallmark runs read this file first; pages defer to it. Amend
intentionally — the file is the rule. Renamed from `design.hum-07.md` to
`design.md` in the target project so it becomes that project's system.

/* Hallmark · studied: yes · DNA-source: url
 * source-url: https://www.usehallmark.com/examples/hum-07/
 * theme: studied-DNA (Hum) · paper oklch(97% 0.012 95)
 * display/body: Plus Jakarta Sans · label: JetBrains Mono
 * axes: light / rounded-sans / multi-accent
 * macrostructure: Narrative Workflow · nav: N10 floating-on-scroll morph · footer: Ft5 statement
 */

## System
- Genre · playful (humanist-soft school)
- Macrostructure · Narrative Workflow — numbered stage timeline (the spine); one section shell, band carries only bg + block padding
- Theme · studied-DNA (Hum catalog theme) · multi-accent on warm cream
- Axes · light (L 97) / rounded-sans (Plus Jakarta Sans, warm humanist) / multi-accent
- Nav · N10 floating-on-scroll morph (flat bar → pill on scroll; height-constant, transform-for-offset, cross-fade-everything, single-curve)
- Footer · Ft5 statement ("Bread takes its time." + meta grid)

## Tokens (canonical · `tokens.css` is the source of truth)
```css
:root, [data-theme="hum"] {
  color-scheme: light;

  /* Multi-accent palette on cream — accent is TIED TO STAGE MEANING, not decoration */
  --color-paper:        oklch(97% 0.012 95);
  --color-paper-2:      oklch(94% 0.016 95);
  --color-paper-3:      oklch(91% 0.020 95);
  --color-rule:         oklch(86% 0.014 90);
  --color-rule-2:       oklch(70% 0.018 85);
  --color-muted:        oklch(52% 0.014 90);
  --color-neutral:      oklch(38% 0.014 100);
  --color-ink-2:        oklch(28% 0.014 250);
  --color-ink:          oklch(20% 0.012 250);
  --color-accent:       oklch(86% 0.18 95);    /* pear — feed stage, character jar */
  --color-accent-deep:  oklch(76% 0.20 95);
  --color-accent-2:     oklch(66% 0.18 235);   /* cyan — mix stage */
  --color-accent-2-deep: oklch(56% 0.20 235);
  --color-accent-3:     oklch(68% 0.24 18);    /* coral — bake climax, the one high-energy moment */
  --color-accent-3-deep: oklch(58% 0.26 18);
  --color-mint:         oklch(80% 0.16 150);   /* LEAD accent — primary CTA + most surfaces */
  --color-mint-deep:    oklch(70% 0.18 150);
  --color-lavender:     oklch(74% 0.16 305);   /* reserve accent */
  --color-lavender-deep: oklch(64% 0.18 305);
  --color-accent-ink:   oklch(20% 0.012 250);
  --color-focus:        oklch(56% 0.20 235);

  /* Per-tile tint surfaces — very low opacity over cream */
  --tint-pear:     oklch(86% 0.18 95 / 0.16);
  --tint-cyan:     oklch(66% 0.18 235 / 0.14);
  --tint-coral:    oklch(68% 0.24 18 / 0.12);
  --tint-mint:     oklch(80% 0.16 150 / 0.18);
  --tint-lavender: oklch(74% 0.16 305 / 0.14);

  /* Type — single rounded humanist sans carries display AND body; mono for labels only */
  --font-display: "Plus Jakarta Sans", "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Plus Jakarta Sans", "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-label:   "JetBrains Mono", "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
  --font-mono:    "JetBrains Mono", "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;

  --text-xs: 0.75rem;    --text-sm: 0.8125rem;  --text-base: 1rem;     --text-md: 1.0625rem;
  --text-lg: 1.25rem;    --text-xl: 1.5rem;     --text-2xl: 2rem;      --text-3xl: 2.5rem;
  --text-display:   clamp(2.75rem, 5.5vw + 0.75rem, 5.25rem);
  --text-display-s: clamp(2rem, 3.25vw + 1rem, 3.25rem);

  --tracking-display: -0.025em; --tracking-tight: -0.014em; --tracking-normal: 0;
  --tracking-label: 0.10em;     --tracking-micro: 0.16em;
  --lh-tight: 1.05;  --lh-snug: 1.18;  --lh-normal: 1.55;  --lh-relaxed: 1.7;

  /* 4-pt-ish spacing scale, named */
  --space-2xs: 0.25rem;  --space-xs: 0.5rem;   --space-sm: 0.75rem;  --space-md: 1rem;
  --space-lg: 1.5rem;    --space-xl: 2.5rem;   --space-2xl: 4rem;     --space-3xl: 6.5rem;
  --space-4xl: 10rem;
  --section-gap: 6.5rem;       --section-head-gap: 1.75rem;

  --page-max: 78rem;  --page-gutter: clamp(1.25rem, 4vw, 3rem);  --measure: 60ch;

  --radius-card: 20px;  --radius-pill: 999px;  --radius-input: 12px;  --rule-card: 1px;
  --shadow-card:       0 12px 32px -16px oklch(20% 0.012 250 / 0.14), 0 1px 2px oklch(20% 0.012 250 / 0.06);
  --shadow-card-hover: 0 24px 56px -20px oklch(20% 0.012 250 / 0.18), 0 2px 6px oklch(20% 0.012 250 / 0.08);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-snap: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-micro: 120ms;  --dur-short: 220ms;  --dur-long: 420ms;
  --dur-wobble: 480ms; --dur-burst: 420ms; --dur-tick: 1200ms;
}
```

## Type rules
- One family (Plus Jakarta Sans) for display + body; weight + size carry the hierarchy (700 display, 500/600 body, 400 lede).
- Labels (eyebrows, chips, stage labels, plan names, footer cols) = JetBrains Mono UPPERCASE, `letter-spacing: 0.10em`, `font-size: 11px`.
- Emphasis = roman, never italic. Use a *clipped gradient underline* on `em`/`.hl`
  (`background-image` line at `background-position: 0 100%`, `box-decoration-break: clone`);
  mint default, per-accent variants (`.hl--pear/.coral/.cyan`).
- Headlines: `text-wrap: balance`; `letter-spacing: -0.025em`; `line-height ~1.05`.

## CTA voice (the canonical Hum button — 3D press)
- Primary · `--color-mint` face, ink text, hard bottom edge `0 4px 0 0 var(--color-mint-deep)` + soft cast shadow · `--radius-pill` · padding `0.8rem 1.4rem` (sm `0.5rem 0.95rem`, lg `1rem 1.7rem`).
- Press = `:active` `translateY(3px)` collapses the bottom edge to `1px`; `:hover` lifts `translateY(-2px)`.
- Secondary · `.btn--outline` — transparent, `1.5px` border (42% accent mix + rule), pill radius; hover fills via `::before` `scaleY` reveal, text takes accent-ink.
- Tertiary · `.btn--text` — no fill/shadow, ink-2 → ink on hover.
- Focus · instant `outline: 3px solid color-mix(--btn-edge 70%, --color-focus)`, offset 3px. Never animate the ring.
- Colour variants map to stage accents: `--mint` (lead), `--pear`, `--cyan`, `--coral` (climax), `--lav` (reserve), `--ink`.

## Motion stance
- No library — vanilla JS + CSS. Reveals: scroll-triggered stagger via IntersectionObserver (`is-in`); numbered node springs in (`--ease-spring`), connector line `scaleY`, panel slides from x.
- Character device: breathing pulse + rising bubbles (infinite `@keyframes`), bursts (`star-burst` coral) on primary CTA.
- Microinteractions: spring on cards/nodes; 3D press on buttons; outline fill on hover.
- Reduced-motion: `scroll-behavior: auto`; kill infinite anims; nodes/lines/panels render visible instantly; `* { animation-duration: 0.01ms }`.

## Provenance
- Source mode · url
- URL · https://www.usehallmark.com/examples/hum-07/
- Date extracted · 2026-07-16
- Attestation · (b) public reference for the user's brand (user disclosed: "hallmark's own public demo/example page — studying the 'hum' mood")
- Confidence · Tokens EXACT (read from source `tokens.css` + `styles.css`). Fonts EXACT (Google Fonts `Plus Jakarta Sans` + `JetBrains Mono`). Rhythm UNKNOWN — HTML alone can't judge density; supply a screenshot for a vision pass if pacing matters.

## Notes — anti-patterns / carry-over cautions
- Multi-accent is the signature; it works ONLY because each accent is bound to *meaning* (mint=primary action, pear=feed, cyan=mix, coral=bake-climax, lavender=reserve). Do NOT sprinkle accents decoratively — that breaks the system.
- Keep sections on ONE shell; differentiate bands by background + block padding only, never by changing edges.
- Emphasis via gradient underline, never italics on headers.
- No template-marketplace DNA; this is Hallmark's own public demo — treat as a mood reference, rebuild with your own content.
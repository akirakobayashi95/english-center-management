# Design — MsMyenEnglish (Hum / Bubble mood, applied)

Locked design system for this app, seeded from a Hallmark study of
`https://www.usehallmark.com/examples/hum-07/` (Hum theme). Every future
Hallmark run reads this file first; pages defer to it. Amend intentionally —
the file is the rule. This is the active system (promoted from design.hum-07.md).

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

## Tokens (canonical · `src/app/globals.css` :root is the source of truth)
```css
:root, [data-theme="hum"] {
  /* Multi-accent palette on cream — accent is TIED TO STAGE MEANING, not decoration */
  --color-paper:        oklch(97% 0.012 95);
  --color-paper-2:      oklch(94% 0.016 95);
  --color-ink:          oklch(20% 0.012 250);
  --color-ink-2:        oklch(28% 0.014 250);
  --color-mint:         oklch(80% 0.16 150);   /* LEAD accent — primary CTA + most surfaces */
  --color-mint-deep:    oklch(70% 0.18 150);
  --color-pear:         oklch(86% 0.18 95);    /* feed stage, character jar */
  --color-cyan:         oklch(66% 0.18 235);   /* mix stage */
  --color-coral:        oklch(68% 0.24 18);    /* bake climax, the one high-energy moment */
  --color-lavender:     oklch(74% 0.16 305);   /* reserve accent */

  /* shadcn token mapping used by this app */
  --background: oklch(97% 0.012 95);
  --foreground: oklch(20% 0.012 250);
  --primary: oklch(80% 0.16 150);
  --primary-foreground: oklch(20% 0.012 250);
  --border: oklch(86% 0.014 90);
  --ring: oklch(70% 0.18 150);
  --radius: 0.625rem;

  /* Type — single rounded humanist sans carries display AND body; mono for labels only */
  --font-display: "Plus Jakarta Sans", "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Plus Jakarta Sans", "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-label:   "JetBrains Mono", "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;

  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Type rules
- One family (Plus Jakarta Sans) for display + body; weight + size carry the hierarchy (700 display, 500/600 body, 400 lede).
- Labels (eyebrows, chips, stage labels, plan names, footer cols) = JetBrains Mono UPPERCASE, `letter-spacing: 0.10em`, `font-size: 11px`.
- Emphasis = roman, never italic. Use a *clipped gradient underline* on `em`/`.hl`.
- Headlines: `text-wrap: balance`; `letter-spacing: -0.025em`; `line-height ~1.05`.

## CTA voice (the canonical Hum button — 3D press)
- Primary · mint face, ink text, hard bottom edge + soft cast shadow · pill radius.
- Press = `:active` collapses the bottom edge; `:hover` lifts.
- Secondary · outline — transparent, 1.5px border, pill radius; hover fills, text takes accent-ink.
- Focus · instant ring, offset 3px. Never animate the ring.

## Motion stance
- No library — vanilla JS + CSS. Reveals: scroll-triggered stagger. Character: breathing pulse + rising bubbles.
- Microinteractions: spring on cards/nodes; 3D press on buttons; outline fill on hover.
- Reduced-motion: `scroll-behavior: auto`; kill infinite anims; render visible instantly.

## Provenance
- Source mode · url
- URL · https://www.usehallmark.com/examples/hum-07/
- Date extracted · 2026-07-16
- Attestation · (b) public reference for the user's brand
- Confidence · Tokens EXACT (read from source CSS). Fonts EXACT (Google Fonts Plus Jakarta Sans + JetBrains Mono).

## Notes — anti-patterns / carry-over cautions
- Multi-accent is the signature; it works ONLY because each accent is bound to *meaning*. Do NOT sprinkle accents decoratively.
- Keep sections on ONE shell; differentiate bands by background + block padding only.
- Emphasis via gradient underline, never italics on headers.
- Applied here at the token layer: Tailwind `amber`→mint and `orange`→pear were repointed so the
  existing dashboard (`src/app/page.tsx`) retints to Hum without editing page literals. `hum-*` named
  colors are available for any new accent usage. Functional status colors (green/red/blue) are left as-is.
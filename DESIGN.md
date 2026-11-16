# Portfolio v2 design specification

Visual reference: user-supplied Santalarch screenshots and its public CSS/animation code. Content authority: Kiran-ZQR/kiranzhang-portfolio, main at 8ef6cc91f1fb686467b7725089d5485d393580ff. This is an independent experiment; never push to the original repository.

## System

- Background #efefef, foreground #101010, subdued #686868, rules #d7d7d7. Inverted mode exchanges the background/foreground and uses #343434 rules. No colored accents, gradients, glass or decorative cards.
- Helvetica Neue / Helvetica / Arial / Microsoft YaHei. Display wordmark is the exact lowercase `kiranzhang`; it is real text, not generated image letters. This supersedes the old template's image-letter directions, per the user's new brief.
- Desktop: eight equal columns, 24px outer detail padding; content aligns at 12.5%, 37.5%, 62.5%. Mobile: four columns and 20px padding. Thin rules are structural alignment aids.
- Open editorial bands: masthead, introduction, four selected-work rows, contact. Preserve original category URLs and all case-study content.
- Homepage allowed copy: kiranzhang; Home; Projects; About; Resume; Contact; Empathetic / Inventive / Analytical; original designer statement; Selected work; four original category names, roles and summaries; original contact statement, email, LinkedIn; functional color toggle, loading, skip and replay labels.

## Motion and navigation

1. On first homepage visit in a tab: real critical-asset progress, original three traits, then two vertical shutters reveal the site; glyphs rise into the masthead with a restrained stagger. Target 2–3 seconds on a fast connection, bounded to 6 seconds. Skip is always available. No loader when JavaScript is unavailable.
2. Returning within the tab or landing at a deep anchor bypasses the blocking sequence. A footer replay button deliberately restarts it.
3. Persistent navigation, real anchors and original case-study links. Never consume wheel or touch events; no scroll hijacking, pinned full-screen traps, automatic project navigation or forced horizontal scrolling.
4. Scroll gently shifts the masthead lettering and diagonal grid line. Project media uses an intersection-triggered clipping reveal, with no hidden reading content. Hover affects only project media and the link underline.
5. Honor prefers-reduced-motion, including changes during the session. All essential content works without animation or JS; keyboard focus stays visible. The loader makes the rest of the document inert only while active and restores focus after Skip/Replay.

## Reference scope

Adapt the grid, typographic scale, masked entry and orchestrated transition. Do not reuse Santal's logo, wording, project media, fonts or source code. Original project images retain their color. Detail-page reading layouts remain content-led with a shared restrained navigation and type treatment; interactive artwork retains its own colors and controls.

## Current showcase and navigation system — 2026-11-16

Default theme is dark; a deliberate light choice persists. Navigation uses two masked text layers for a vertical roll, followed by a directional curtain and destination reveal. Fine mouse pointers use a small difference-blended circle that expands over controls; coarse input retains native behavior.

Tencent: closed phones form a close, outward-leaning pair, using the user’s latest framing reference. The left screen is white with the original Tencent News logo. On expansion the logo phone grows and leads in depth. Keep safe physical separation through the spring overshoot. No spin, fullscreen or visible toolbar. Hover temporarily unfolds; touch and keyboard toggle the entire cover; Escape closes it. Titles and View project links own navigation.

Academic homepage cover: a single arrangement of a phone, open laptop with keyboard and trackpad, portrait iPad and a Vision Pro style headset. The curved headset glass includes the nose cutout and a separate rear strap. Original FurSure, PROFILED and Lead Me artwork provides screen content. These locally authored meshes are presentation reconstructions, not original product CAD files. All four devices spread within the cover on hover using the same spring and monochrome-to-color behavior as the Tencent pair. Clear the inherited mosaic aspect ratio; both covers fill the same grid span, with identical widths and closed/open height rules at every breakpoint. Category and project detail pages remain unchanged.

Masthead: retain the accessible name kiranzhang, using a local SVG alphabet collage of bold sans, pixel, serif, outline and hand-drawn forms. Repeated letters use distinct treatments. All strokes and fills follow currentColor, preserving dark/light theme contrast. Keep the existing per-glyph opening reveal and native page navigation. No external font or raster-image dependency is required for the mixed wordmark.

Both scenes resize and draw within the same animation frame. Load all textures and prime a frame before replacing the static fallback. Pause rendering outside the viewport or hidden document. Respect reduced motion. No scroll interception or continuous idle rotation.

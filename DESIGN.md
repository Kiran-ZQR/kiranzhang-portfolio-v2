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

## Tencent cover interaction (2026-11-14)

The first project uses two generic, physically thick Three.js phone objects with the original Tencent launch logo and AI briefing screen captures. Collapsed framing crops the lower part of the models; hover opens the cover and restores original color. Expand/Collapse provides the same flow on touch and keyboard. Horizontal dragging rotates the pair through front/side/back; automatic rotation is explicit and pausable. The project title and View project link retain navigation ownership. No custom cursor layer: native cursor, with grab/grabbing only on the draggable stage. Reduced motion disables spin and dragging while keeping the expandable color presentation. Offscreen/hidden render work pauses; no-WebGL or context-loss preserves the two-image fallback. Other homepage sections keep the existing layout.

### Cover stability correction

Closed phones fan outward with the right device genuinely in front. Maintain a separating depth interval across the complete reveal, not intersecting screen planes. The left display is white with the exact Tencent News logo sampled from the original homepage asset. Remove the caption strip and visible expand/collapse wording; retain accessible icon controls in the upper corner. ResizeObserver only marks dimensions dirty; the next render frame resizes and draws together to avoid clearing the displayed buffer between frames. Preload both textures and draw before revealing WebGL; separate bezel, screen and island depth planes.

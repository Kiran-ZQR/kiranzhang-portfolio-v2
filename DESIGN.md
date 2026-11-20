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
4. A sticky, scroll-driven diagonal seam turns and clips the introduction, then brings up the portfolio’s Interactive narratives / AI technology themes. It reverses with upward scrolling and releases into Selected work. The entire incoming panel (background and title together) uses one clip polygon. Its two endpoints also drive the SVG seam; do not independently remap a text mask. Keep the incoming panel hidden during the initial line turn. This is a native scroll sequence, with no wheel interception. Project media uses an intersection-triggered clipping reveal, with no hidden reading content. Hover affects only project media and the link underline.
5. Honor prefers-reduced-motion, including changes during the session. All essential content works without animation or JS; keyboard focus stays visible. The loader makes the rest of the document inert only while active and restores focus after Skip/Replay.

## Reference scope

Adapt the grid, typographic scale, masked entry and orchestrated transition. Do not reuse Santal's logo, wording, project media, fonts or source code. Original project images retain their color. Detail-page reading layouts remain content-led with a shared restrained navigation and type treatment; interactive artwork retains its own colors and controls.

## Homepage product presentations — 2026-11-18

Keep the heavy KiranZhang wordmark (capital K and Z). Its 1.05 line height and responsive lower padding leave room for the g descender inside the entrance mask.

The four cover studies follow the user’s editorial portfolio reference: alternating paper and graphite grounds, restrained Georgia captions, aligned small metadata, generous negative space and original work as the visual focus. A shared 28px desktop / 20px mobile inset and resting height establish one system. Category links and the surrounding Helvetica site remain intact. The reference PDF and its images are not published or reused as site assets.

Tencent cover: cool sage paper, one centered logo-screen iPhone, with no detached UI cards. Show the complete phone at rest; hover expands both the stage and the product presentation. The titanium frame, status bar, Tencent logo remain.

Academic cover: graphite with a localized quiet cyan reflection. Keep the calibrated laptop perspective, back-facing tablet, enlarged Vision Pro above it and detached phones at right. Reframe to show complete device silhouettes at rest; expansion grows the ensemble without redistributing or colliding devices. No large background project lettering.

Multimedia cover: cool paper, a concise serif human/machine title and oversized original hand artwork. A fine contact-point annotation connects the composition to interaction design. Art reaches the edges intentionally; cover captions share the common margins.

Other Works cover: original Fortress and abstract artworks displayed as two gallery prints on graphite. White print borders and small captions replace the previous full-bleed crop. A dark backing under the source abstract PNG preserves its translucent colors. The print pair opens slightly on hover; no extra controls.

All covers are monochrome at rest and restore their original color on hover or keyboard focus. First and second retain expansion, touch/keyboard toggle and Escape behavior. Third and fourth retain their existing category navigation.

Existing hover expansion, grayscale-to-original-color, damped spring, touch/keyboard toggle and Escape behavior remain. No rotation toolbar or forced browser fullscreen. Texture readiness and the first render precede the WebGL reveal; resize and render in the same animation frame. Offscreen/hidden rendering pauses. Reduced motion keeps the presentation static.

The iPhone 17 Pro Max (MajdyModels) and MacBook Pro M3 16 inch 2024 (jackbaeten) are CC BY 4.0 assets; model-credits.html records sources, license and changes. Scripts import the exact pinned model blobs with SHA-256 verification once and store them in this independent repository. Runtime assets, WebP textures, Meshopt decoder and Three.js r160 loader files are served locally. Official example-loader imports are bridged to the existing pinned Three.js runtime to avoid a duplicate core. Tablet, glass cards and studio environment are authored locally. Vision Pro is the CC BY 4.0 model by pravinvamp, with the full woven strap and glass-face textures preserved; pinned sources are integrity-checked and packed into one local GLB. Original project details and category pages remain unchanged.

## Scroll-linked typography and mask — 2026-11-20

Replace the decorative full-turn line and separate shutter reveal. The opening spans the full viewport, including the masthead, rather than starting below navigation. One content plane contains the introduction and the large design-direction title and translates vertically with native scroll. A viewport-sized linear-gradient mask clips that plane; a hairline uses the identical angle and 50% boundary. The initial angle is atan2(viewport height, viewport width) minus 180 degrees and reaches zero after scrolling 65% of a viewport. Masking starts after 12%. At zero degrees the boundary remains horizontal while the title keeps moving through it. Reverse scrolling reverses the same values. Vertical grid axes remain at 12.5% and 62.5%; mobile uses center vertical/horizontal axes. There is no independent 360-degree spin or delayed symmetric window. Reduced motion shows a static introduction. The Tencent single-phone cover and other project presentations remain intact. Mobile wordmark sizing also leaves its final g inside the masthead.

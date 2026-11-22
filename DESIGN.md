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

Homepage clearance fix: the introduction starts below the measured masthead and navigation plus a responsive gap, preventing wide-view opening text from being covered by the bar. The heading entrance remains at the same document position because the description row compensates for its new top padding. The navigation background is transparent while the hero intersects it, so the rotating line continues through the bar; it returns to the normal solid paper background below the hero. Angle, mask threshold, scroll translation and heading gap are unchanged.

## Interior navigation — 2026-11-21

A single 72px global band carries KiranZhang and five site destinations on the eight-column grid. Interior links use a quiet color/underline response; no rolling text or rotating labels. A separate sticky context band carries a linked breadcrumb and a native disclosure to switch categories or sibling projects. The current page is marked semantically and visually. Tencent Business/Explore remains a real tablist with its original buttons, panel relationships, keyboard behavior and URL hashes. Existing legacy islands, rotated tabs, redundant global links and floating project pickers are replaced after their page setup. Dropdowns use the site's opaque paper, hairline border and shared type, with Escape/outside-click closure. Mobile splits the global band into brand and five destinations, wraps breadcrumbs and gives project menus a single column. Header measurements set local TOC and anchor offsets. Original artwork, project content and homepage motion are unchanged.


## Reading flow and navigation responsibilities — 2026-11-21

Global navigation changes site areas. Breadcrumb links move up the hierarchy; Tencent cases now show the Business/Explore subgroup explicitly. The context picker switches only among siblings in the current subgroup. It no longer repeats a return-to-list action. A single source list drives that picker and the reading-end previous/next links. Tencent Business has eight projects and Explore has two; group boundaries are not crossed by next-project navigation.

Remove the fixed return box and all legacy boxed sequence controls. Each project ends in an open editorial band on the shared paper surface: a quiet return-to-group link and progress count above large previous/next titles, fine rules and drawn directional arrows. At the last project, a text completion state replaces a misleading next link. Keyboard focus and mobile stacking remain clear. The weaving game keeps its sequence inside its existing completion dialog.

Cross-page motion uses a 700ms symmetric closing shutter and a 1100ms decelerating reveal, with one coherent content-opacity arrival. Remove the decorative full-turn line and staggered heading crops from route transitions; homepage scroll-linked seam motion is unchanged. Destination typography and up to four visible images settle before reveal, with a 1600ms upper bound on resource waiting. Deferred navigation layout finishes before opening. Real hovered/focused project links may prefetch the destination document. Reduced-motion navigation remains immediate; BFCache restoration clears transient curtains.

## Category exhibition layouts — 2026-11-21

Remove the weaving-model utility from Multimedia's public project catalogue. Remove the added reading-end previous/next bands from all project pages; hierarchical breadcrumbs and same-group switching remain the navigation authority. No fixed return boxes or automatically inserted end navigation.

The four category indexes now use one exhibition system: a large visual plate and project description at left, with a directly linked project index at right. Actual titles, summaries and covers are extracted from the original category content; no project media is replaced by reference material. The feature stays available while reading the index where viewport space permits. Hover or keyboard focus selects a preview, using a decoded-image mask reveal; a direct click opens the project in one action. Image, title, counter and destination commit together after decoding, with stale requests discarded. No autoplay. Existing Tencent Business/Explore panels and accessible tabs remain independent and keep their hash behavior. On narrow screens, the feature and index stack; each index row has its own thumbnail and direct destination, so touch does not require hover. Reduced motion changes previews instantly. The homepage's design and scroll seam are unchanged.


## Complete artwork and a single contextual header — 2026-11-22

Supersedes the shared cropped preview and stacked breadcrumbs from the previous iteration. Each project keeps its complete original cover: landscape artwork follows its native ratio, portrait boards fit inside a cool paper surround, and paired interface screens use contain. Two columns have a 100px stagger; each third piece is a wider centered feature. Mobile uses one continuous column. No raster crops or invented project artwork. Grayscale returns to original color on hover/focus; the intact art lifts 6px without clipping.

All project category and detail pages share one 80px contextual row (72px mobile). Brand returns home; category title returns to its collection; Tencent uses the original live tabs relabeled 迭代需求 and 探索需求. Other categories list their own projects directly. Remove About, Resume, Contact, breadcrumbs, group menus and extra sticky TOC from project headers. On mobile local links scroll inside the same row.

Each case ends with one forward destination and a small collection return link. Forward stays within the Tencent subgroup or current category; the final case returns to the collection. Loom remains excluded. Existing curtain navigation retains its measured arrival and reduced-motion fallback. Category tab changes animate as one coherent 750ms group.

Reference: Driezie work page source shows a compact brand/menu header and individual project scene cards with their own captions; applied the separation of global/local navigation and individual artwork composition, without copying its brand or media. The supplied PDF informs restrained framing, cool paper, generous space and artwork-first hierarchy. Verified four collections and 21 case headers/end routes, desktop 1440x1000 and mobile 390x844.

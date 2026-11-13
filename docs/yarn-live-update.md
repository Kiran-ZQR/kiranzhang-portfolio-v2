# Live yarn title and loom

Supersedes the raster opening described in weave-palette-update.md. No generated image is used in the active title/opening.

- assets/js/yarn-title.js defines editable English letter paths and renders five individually offset coloured strands by arc length. The landing and opening share this implementation.
- assets/js/weave-opening.js reveals these paths over time, then clears staggered apertures. Skip, Escape and reduced motion remain supported.
- assets/js/loom-art.js reuses the original model with slimmer proportions, bevelled members and metal collars, adds exactly five bobbins (three left / two right), and connects each to the heddles. Bobbin rotation, visible winding seams, yarn travel markers and heddle movement derive from the user's wheel angle, not an independent timer.
- assets/js/weave-experience.js retains the original Conway engine/state/export flow. The long straight fabric backing remains visible under the generated layer; the generated surface is offset slightly to avoid z-fighting.

This is a procedural real-time interpretation of the approved art direction, not a photoreal replica of the generated concept. No deployment performed.

Regression checks: test-weave-v4.cjs, test-weave-palette.cjs, test-yarn-motion.cjs under ../.preview, plus scripts/test-weave-state.cjs.

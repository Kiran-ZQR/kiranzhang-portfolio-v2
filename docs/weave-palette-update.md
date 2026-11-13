# Textile palette and straight cloth

Local-only update: approved wide yarn visual in assets/life-weave/yarn-opening-wide.png; opening canvas displays its artwork area (without mock navigation), then clears staggered square apertures to reveal the real scene. Escape/skip and reduced motion remain supported. Image loading failure dismisses the opening.

assets/css/weave-palette.css scopes the white, orange, pink, yellow and turquoise direction to life-weave.html. Model material clones are scoped to the experience; loom-model.html and the original materials remain unchanged. Element IDs, Conway rules and persisted grid values are unchanged; only their display colours changed.

Both idle and generated fabric use a constant-width plane at z=.95 from y=1.185 to y=.04. The interactive 40-degree azimuth uses an orthographic camera at target height so vertical edges stay parallel rather than widening towards the viewer. The historical curved model geometry remains in assets/js/loom-model.js for the standalone reference viewer.

Checks: scripts/test-weave-state.cjs, ../.preview/test-weave-v4.cjs and ../.preview/test-weave-palette.cjs. The art opening is a raster title with a procedural transition, not a simulation of individual physical yarn strands.

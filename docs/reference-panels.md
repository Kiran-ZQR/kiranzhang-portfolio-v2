# Reference-faithful element panels

The current runtime uses the user's supplied 735 × 589 reference sheet unchanged, not the previous AI-generated patterns. `assets/js/element-patterns.js` creates SVG viewports over the supplied panels, omitting sheet labels and margins. `scripts/bundle-reference-patterns.cjs` embeds the sheet for origin-clean local WebGL and PNG export.

Mapping: wood = lower left; fire = lower middle; earth = lower right; metal = upper middle; water = upper right. The upper-left alternate remains in the preserved sheet. Original generated files are retained but are no longer loaded.

Fabric preserves each complete upper/lower composition. No additional weave stripes, connecting strokes, gradients or palette filters are applied. The existing Conway state drives only small registration-dot accents; the reference shapes remain fixed.

Resolution is limited by the supplied screenshot (approximately 179 × 224 pixels per panel). This is not a claim of a newly generated high-resolution original.

# Reference loom / first geometry study

Open `loom-model.html`, or use the model preview link under Start on the weaving landing page. This is a separate preview; no game rules are changed.

Built from the user's front-ish photograph and structural perspective drawing. These are not orthographic dimensioned drawings. Approximate dimensions, hidden joins and rear assembly are inferred; do not use for manufacturing. Model includes named groups for timber frame, heddle shafts, reed, warp threads, rollers, linen, treadles and crank. No animation of the mechanism is claimed in this stage.

`assets/js/loom-model.js` builds actual mesh geometry using local Three.js 0.160.1 (MIT; license in assets/vendor). Classic scripts support the existing file-URL preview; no network is needed at runtime. Procedural canvas textures supply fine grain and linen structure without generated bitmap assets.

`assets/life-weave/hand-loom-reference.glb` is the saved GLB 2.0 export. Export includes geometry, component hierarchy, transforms and base-colour PBR materials, not the procedural preview textures or studio lighting. Browser export creates the same structure even if warp threads are hidden in the viewer. Units approximate metres.

Verification: `node .preview/test-loom-model.cjs` from the parent workspace checks WebGL startup, five camera presets, hide/show warp, keyboard orbit, GLB header/geometry/hierarchy, mobile horizontal overflow and browser errors; saves GLB and desktop/mobile screenshots. Source photos remain in the conversation, not republished in the site.

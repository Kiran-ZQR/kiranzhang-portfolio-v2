# Reference-front layout — October 12

The latest user-supplied image supersedes the colourful side-view layout. The opening now leads directly to the active loom, with no landing/start interstitial.

- assets/js/reference-loom.js replaces the active experience model, retaining assets/js/loom-model.js and assets/js/loom-art.js for reference/history. It builds an ivory chassis, wooden beams, green braces, red brackets, silver rods, fasteners, gears and five upright bobbins. The controller is an independently rendered clone of the same wheel geometry and state.
- assets/css/weave-reference.css positions the Chinese title, three navigation entries, loom, wheel, five element circles and finish action against a 1586 × 992 desktop artboard, with a separate mobile layout.
- assets/js/tapestry-render.js is a visual encoding layer. It draws broad textile bands and motifs using the existing grid and element; B3/S23 and seed rules are unchanged. Decorative motifs are not themselves simulated cells.
- The initial fabric is explicitly a sample, not a completed user work. An empty session cannot export it. The actual result uses only revealed, user-generated bands. Constant fabric width and vertical descent are retained as requested earlier.
- Chinese title uses the locally available KaiTi font rather than a traced copy of the reference calligraphy. Procedural geometry/materials are not a pixel-identical reproduction of the offline-rendered reference.

Verified with ../.preview/test-reference-loom.cjs: auto entry, five supplies, empty export protection, pointer rotation, 18-generation evolution, PNG restoration, mobile overflow and restart. Older tests expecting a start button are superseded by this entry-flow test. No publication.

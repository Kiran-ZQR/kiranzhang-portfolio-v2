# Guided loom experience

> Historical controller documentation. Since 2026-10-10, the active page loads `assets/js/weave-experience.js` and `assets/js/weave-experience-state.js`. The old controller is retained but not loaded. See `weave-experience-v2.md` for the current flow and tests below; the five-element completion requirement described here no longer applies.

The third homepage category opens `life-weave.html`, now the integrated model-led experience. `loom-model.html` remains a separate geometry preview and GLB exporter. No homepage category layout was changed.

## Flow

Idle full loom → click model or Start → approach, side orbit, straight-on crank → select element → drag one net revolution and release → orbit to front fabric → show seed markers for one second → 18 generations of B3/S23 → manual commit → keep historical traces → choose next element and return to crank. All five distinct elements opens a generated PNG result. Free play is available after completion.

The initial seeded patterns repeat around eight marked anchor positions. The simulation runs on the actual model's front cloth via a dynamic canvas texture, not on a separate screen. Crank rotation is a pivoted component. Beater and treadles receive subtle illustrative motion at commit; this is not a mechanical engineering simulation. The original reference-based mesh is reused via the `guided` branch of `assets/js/loom-model.js`.

## Input and boundaries

- Either rotation direction works. Opposite movements subtract; small back-and-forth movements do not count as a revolution.
- Partial rotations persist across drags. Changing element is locked once rotation begins; turning back to zero unlocks it.
- Quarter-turn button and focused dial arrow keys provide keyboard/touch alternatives. Complete rotation via these controls automatically releases.
- Incomplete elements are auto-selected for subsequent rounds; completed elements cannot be selected until free play.
- Dialogs freeze camera time, reveal, weaving and evolution. Evolution also has explicit pause. Hidden tabs suspend the animation loop.
- Exit requires confirmation and clears session state. No backend, multiplayer or persistent storage is implied.
- Reduced-motion preference shortens camera transitions and weaving. No autoplay audio. Sound is user enabled.

## Styling

Reference: https://driezie.studio/ viewed 2026-10-09. Warm paper (#f4f2ed), restrained editorial grid, large mixed type, generous space and a warm accent; no third-party brand assets or copy reused. Existing capsule site navigation is preserved.

## Tests

Run from the workspace parent: `node .preview/test-weave-journey.cjs` and `node .preview/test-journey-edges.cjs`. Browser tests exercise real circular mouse movement, all five rounds, seed-reveal stage, canvas export serialization, mobile layouts, keyboard reversal, dialog pause and restart. `node .preview/test-loom-model.cjs` tests the independent model viewer/exporter. PNG serialization can be verified even when browser-managed downloads are blocked.

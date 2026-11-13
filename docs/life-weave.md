# 生命之轮：五元编织

> Historical notes for the original 2D prototype. The active page now uses the integrated 3D crank-to-cloth journey. See [weave-journey.md](weave-journey.md) for current behavior, dependencies and tests. `assets/js/life-weave.js` / `assets/css/life-weave.css` are retained but no longer loaded by the page.

Entry: homepage third category → `life-weave.html`. Standalone vanilla HTML/CSS/Canvas; no runtime packages, remote requests, backend, or API keys. Works via file URL or static hosting.

## Source

Figma file `FP4fNyutx3JSFPyk7BVjPJ`, Page 1. Original author: 张晴然. Author's title and project description are preserved in the “关于原作” dialog. This is an interactive adaptation, not a pixel-for-pixel slide reconstruction.

Local assets in `assets/life-weave/`:

- installation.png: original photograph from node 766:16 (parent 766:13).
- wood.png: original initial pattern 427:60.
- fire.png: original initial pattern 427:64.
- earth.png: original initial pattern 448:16.
- metal.png: original initial pattern 448:8.
- water.png: original initial pattern 448:13.

These are original image assets, not design screenshots. Pattern images retain their square aspect ratio; installation photograph is displayed uncropped with natural height.

## Adaptation and rules

The physical rotating selector and pedal become five element selectors, symmetric seed planting, and a weave action. Conway B3/S23 runs in `assets/js/life-weave-core.js` on a 100×44 finite grid. Surviving cells retain colour, births inherit the majority neighbour colour. Colour ties resolve by element index. Five seed patterns create different lifelike behaviours. Planting repeats seeds along the warp/weft; no automatic random births occur during simulation. Disappearing cells leave traces. Weaving commits those traces, and the final textile mirrors/repeats them as a new artwork.

Added for the web: five-element progression, optional synthesized notes, keyboard/touch input, a full-screen button, downloadable generated canvas, and free play. No multiplayer, external AI generation, or persistence is claimed. Reloading resets the experience. Sound defaults off. Background-tab rendering stops and dialogs pause evolution. Reduced-motion preference disables introductory drift and shortens the weaving transition.

## Verification

`node .preview/test-life-weave.cjs` from the workspace (test-only Playwright installed under `.preview/browser-tools`). Tests cover oscillator/still-life rules, original asset loading, full five-element completion, canvas PNG serialization, pause, dialogs, keyboard controls, and mobile horizontal overflow. Screenshots are in workspace `.preview/`. Browser-managed download permissions may affect file downloads; the result canvas also supports the browser's image-save context menu.

# Full-cloth and board-layout correction

The loom viewport now reserves 100px for desktop navigation and 78px on mobile. The current accumulated Conway grid maps to the entire fabric (repeat 1, offset 0); the former clipped history-band renderer is removed. Export now matches the whole live cloth at 1000 × 2048. Previous serialized grids remain readable. New seeds accumulate into the next grid; B3/S23 is unchanged.

SentAIment uses the SADRA work-heading / work-board-list / board-sheet / board-dialog components and assets/js/academic-projects.js zoom controls. The promotional hero and coloured circle section have been removed. Its navigation, and the category directory navigation, use dark tokens; the loom retains light tokens. Original low-resolution boards are displayed at native crop width with an explicit source limitation, not represented as newly recovered high-resolution originals.

Checks: scripts/test-weave-state.cjs (9 passed), ../.preview/test-full-cloth.cjs (desktop/mobile navigation clearance, cells in both cloth halves, full-size export, dark nav, board layout, zoom). No publication.

/* Pure state contract shared by the live loom and regression tests. */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];
  const stages = ['landing', 'approach', 'weaving', 'result'];
  const validElement = value => Number.isInteger(value) && value >= 0 && value < 5;
  const deltaAngle = (previous, current) => Math.atan2(Math.sin(current - previous), Math.cos(current - previous));
  // Multiples such as 11 * TAU divide back to 10.999999999999998.
  // Use one boundary convention for progress, input, selection and restoration.
  const turnsAt = angle => {
    const nearest = Math.round(angle / TAU);
    return Math.abs(angle - nearest * TAU) < 1e-10 ? nearest : angle / TAU;
  };

  function create() {
    return { version: 1, stage: 'landing', dragging: false, wheelAngle: 0,
      effectiveAngle: 0, currentElement: 0, queuedElement: null, segments: [] };
  }

  function summary(state) {
    const turns = turnsAt(state.effectiveAngle);
    const completedTurns = Math.floor(turns);
    return { turns, completedTurns, currentProgress: turns - completedTurns,
      hasArtwork: state.effectiveAngle > 0,
      elementSequence: state.segments.map(segment => segment.element) };
  }

  // Positive delta is clockwise in screen coordinates (pointer Y points down).
  // Mechanical angle may reverse. A high-water mark prevents rocking the
  // handle over the same arc from repeatedly creating new fabric.
  function rotate(state, delta) {
    if (state.stage !== 'weaving' || !Number.isFinite(delta) || Math.abs(delta) > Math.PI) return state;
    const rawAngle = state.wheelAngle + delta;
    const boundary = Math.round(rawAngle / TAU) * TAU;
    const wheelAngle = Math.abs(rawAngle - boundary) < 1e-10 ? boundary : rawAngle;
    const effectiveAngle = Math.max(state.effectiveAngle, wheelAngle);
    if (!Number.isFinite(wheelAngle) || !Number.isFinite(effectiveAngle)) return state;
    const segments = state.segments.map(segment => ({ ...segment }));
    let currentElement = state.currentElement;
    let queuedElement = state.queuedElement;
    const first = Math.floor(turnsAt(state.effectiveAngle));
    const last = Math.ceil(turnsAt(effectiveAngle)) - 1;
    // An input of at most PI crosses at most one boundary (two segments).
    // Bounded integer iteration cannot stall on a floating-point cursor.
    for (let part = 0; effectiveAngle > state.effectiveAngle && part < 2; part++) {
      const index = first + part;
      if (index > last) break;
      const end = Math.min(effectiveAngle, (index + 1) * TAU);
      if (!segments[index]) segments[index] = { element: currentElement, angle: 0 };
      segments[index].angle = Math.min(TAU, Math.max(0, end - index * TAU));
      if (end === (index + 1) * TAU) {
        currentElement = validElement(queuedElement) ? queuedElement : (segments[index].element + 1) % 5;
        queuedElement = null;
      }
    }
    return { ...state, wheelAngle, effectiveAngle, currentElement, segments, queuedElement };
  }

  function reduce(state, event) {
    switch (event.type) {
      case 'ENTER': return state.stage === 'landing' ? { ...state, stage: 'approach', dragging: false } : state;
      case 'APPROACH_DONE': return state.stage === 'approach' ? { ...state, stage: 'weaving' } : state;
      case 'DRAG_START': return state.stage === 'weaving' ? { ...state, dragging: true } : state;
      case 'DRAG_END': return { ...state, dragging: false };
      case 'ROTATE': return rotate(state, event.delta);
      case 'SELECT_ELEMENT': {
        const info = summary(state);
        if(state.stage !== 'weaving'||!validElement(event.element))return state;
        return info.currentProgress===0?{...state,currentElement:event.element,queuedElement:null}:{...state,queuedElement:event.element};
      }
      // Zero progress is allowed: result UI must use hasArtwork for its empty state.
      case 'FINISH': return state.stage === 'weaving' ? { ...state, stage: 'result', dragging: false } : state;
      case 'CONTINUE': return state.stage === 'result' ? { ...state, stage: 'weaving', dragging: false } : state;
      case 'RETURN_HOME': return { ...state, stage: 'landing', dragging: false };
      case 'RESET': return create();
      default: return state;
    }
  }

  function serialize(state) {
    return JSON.stringify({ ...state, dragging: false });
  }

  function restore(json) {
    try {
      const s = JSON.parse(json);
      if (!s || s.version !== 1 || !stages.includes(s.stage) || !validElement(s.currentElement) ||
          !Number.isFinite(s.wheelAngle) || !Number.isFinite(s.effectiveAngle) || s.effectiveAngle < 0 ||
          s.wheelAngle > s.effectiveAngle || !Array.isArray(s.segments) ||
          s.segments.length !== Math.ceil(turnsAt(s.effectiveAngle))) return create();
      for (let i = 0; i < s.segments.length; i++) {
        const part = s.segments[i];
        const expected = Math.min(TAU, s.effectiveAngle - i * TAU);
        if (!part || !validElement(part.element) || !Number.isFinite(part.angle) || Math.abs(part.angle - expected) > 1e-8) return create();
      }
      // Never restore pointer capture or an interrupted camera transition.
      return { version: 1, stage: s.stage === 'approach' ? 'landing' : s.stage,
        dragging: false, wheelAngle: s.wheelAngle, effectiveAngle: s.effectiveAngle,
        currentElement: s.currentElement, queuedElement:validElement(s.queuedElement)?s.queuedElement:null,
        segments: s.segments.map(({ element, angle }) => ({ element, angle })) };
    } catch { return create(); }
  }
  const api = { TAU, ELEMENTS, create, reduce, summary, deltaAngle, serialize, restore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WeaveExperienceState = api;
})(typeof window !== 'undefined' ? window : globalThis);

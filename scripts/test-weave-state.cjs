const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../assets/js/weave-experience-state.js');
const core = require('../assets/js/life-weave-core.js');
const send = (s, type, extra = {}) => S.reduce(s, { type, ...extra });
const start = () => send(send(S.create(), 'ENTER'), 'APPROACH_DONE');
const turn = (s, delta = Math.PI / 2) => send(s, 'ROTATE', { delta });
test('128 turns and restored boundaries finish under an independent watchdog', async () => {
  const { Worker } = require('node:worker_threads');
  const worker = new Worker(`
    const {parentPort,workerData}=require('node:worker_threads');
    const assert=require('node:assert/strict'), S=require(workerData);
    let s={...S.create(),stage:'weaving'};
    for(let i=1;i<=128*64;i++){
      s=S.reduce(s,{type:'ROTATE',delta:S.TAU/64});
      if(i%64===0){
        assert.equal(S.summary(s).completedTurns,i/64);
        assert.equal(S.summary(s).currentProgress,0);
        s=S.restore(S.serialize(s));
        assert.equal(s.segments.length,i/64);
        s=S.reduce(s,{type:'SELECT_ELEMENT',element:3});
        assert.equal(s.currentElement,3);
      }
    }
    assert.equal(S.summary(s).turns,128);
    parentPort.postMessage('ok');
  `, {eval:true,workerData:require.resolve('../assets/js/weave-experience-state.js')});
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{worker.terminate();reject(new Error('Angle reducer froze at a circle boundary'));},3000);
    worker.once('message',()=>{clearTimeout(timer);resolve();});
    worker.once('error',e=>{clearTimeout(timer);reject(e);});
  });
});
test('first element freely selectable; transition gates input', () => {
  const s = S.create();
  assert.deepEqual(turn(s), s);
  assert.equal(start().currentElement, 0);
  assert.equal(send(start(), 'SELECT_ELEMENT', { element: 3 }).currentElement, 3);
});

test('mid-turn selection queues and survives restore without rewriting fabric',()=>{
 let s=turn(start());s=send(s,'SELECT_ELEMENT',{element:4});
 assert.equal(s.segments[0].element,0);assert.equal(s.queuedElement,4);
 s=S.restore(S.serialize(s));for(let i=0;i<3;i++)s=turn(s);
 assert.equal(s.currentElement,4);s=turn(s);assert.equal(s.segments[1].element,4);
});
test('quarter mapping, release and reverse preserve committed fabric', () => {
  const initial = start();
  let s = turn(initial);
  assert.equal(S.summary(s).currentProgress, .25);
  assert.equal(initial.segments.length, 0);
  s = send(send(s, 'DRAG_START'), 'DRAG_END');
  assert.equal(s.dragging, false);
  s = turn(s, -Math.PI / 2);
  assert.equal(s.wheelAngle, 0);
  assert.equal(S.summary(s).currentProgress, .25);
  s = turn(s);
  assert.equal(S.summary(s).currentProgress, .25);
  assert.equal(S.summary(turn(s)).currentProgress, .5);
});
test('one turn is sufficient; repeated elements and more than five turns work', () => {
  let s = start();
  for (let i = 0; i < 4; i++) s = turn(s);
  assert.equal(S.summary(s).completedTurns, 1);
  assert.equal(s.currentElement, 1);
  s = send(s, 'SELECT_ELEMENT', { element: 0 });
  for (let i = 0; i < 20; i++) s = turn(s);
  assert.equal(S.summary(s).completedTurns, 6);
  assert.deepEqual(s.segments.slice(0, 2).map(x => x.element), [0, 0]);
  assert.equal(send(s, 'FINISH').stage, 'result');
});
test('partial finish, continue, return home and explicit reset', () => {
  let s = turn(start(), Math.PI);
  s = send(s, 'FINISH');
  assert.equal(S.summary(s).turns, .5);
  assert.equal(S.summary(s).hasArtwork, true);
  s = send(s, 'CONTINUE');
  s = send(s, 'RETURN_HOME');
  s = send(send(s, 'ENTER'), 'APPROACH_DONE');
  assert.equal(S.summary(s).turns, .5);
  assert.deepEqual(send(s, 'RESET'), S.create());
  assert.equal(S.summary(send(start(), 'FINISH')).hasArtwork, false);
});
test('pointer angle wraps across both sides of pi', () => {
  const rad = Math.PI / 180;
  assert.ok(Math.abs(S.deltaAngle(179 * rad, -179 * rad) - 2 * rad) < 1e-12);
  assert.ok(Math.abs(S.deltaAngle(-179 * rad, 179 * rad) + 2 * rad) < 1e-12);
});
test('small input steps settle at a full turn; crossing boundary preserves both segments', () => {
  let s = start();
  for (let i = 0; i < 360; i++) s = turn(s, Math.PI / 180);
  assert.equal(S.summary(s).completedTurns, 1);
  assert.equal(S.summary(s).currentProgress, 0);
  s = turn(s, Math.PI / 4);
  assert.equal(s.segments.length, 2);
  assert.equal(s.segments[0].angle, S.TAU);
  assert.equal(s.segments[1].element, 1);
  assert.equal(send(s, 'SELECT_ELEMENT', { element: 4 }).currentElement, 1);
});
test('serialization round trip and invalid data', () => {
  const s = send(turn(start()), 'DRAG_START');
  assert.deepEqual(S.restore(S.serialize(s)), { ...s, dragging: false });
  for (const bad of ['broken', 'null', '{}', JSON.stringify({ ...s, effectiveAngle: -1 }), JSON.stringify({ ...s, segments: [] })]) {
    assert.deepEqual(S.restore(bad), S.create());
  }
  for (const delta of [NaN, Infinity, 100]) assert.deepEqual(turn(s, delta), s);
});
test('existing Conway blinker remains B3/S23', () => {
  const grid = new Uint8Array(25);
  core.plant(grid, 5, 5, 2, 2, 3);
  const next = core.step(grid, 5, 5);
  assert.deepEqual([...next].map((x, i) => x ? i : -1).filter(x => x >= 0), [7, 12, 17]);
  assert.deepEqual(core.step(next, 5, 5), grid);
});

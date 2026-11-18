import assert from 'node:assert/strict';
import {
  cargoBatch,
  cargoSummary
} from '../experiment-model.js';
assert.deepEqual(cargoSummary(cargoBatch(1)), {
  upstream: 0,
  delivered: 12,
  total: 12
});
assert.deepEqual(cargoSummary(cargoBatch(1, true)), {
  upstream: 12,
  delivered: 0,
  total: 12
});
let last = 0;
for (let i = 0; i <= 100; i++) {
  const t = i / 100,
    n = cargoSummary(cargoBatch(t)),
    blocked = cargoBatch(t, true);
  assert(n.delivered >= last);
  last = n.delivered;
  assert(blocked.every(p => p.stage <= 1 && !p.delivered));
  assert.equal(blocked.length, 12)
}
assert(cargoBatch(-1).every(p => p.stage === 0));
assert.equal(cargoSummary(cargoBatch(5)).delivered, 12);
console.log('Control reaches surface; blocked cargo accumulates upstream; counts and boundaries verified.');

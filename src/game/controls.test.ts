import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
const c = await import('./controls');

test('default keys pass through and rebinding remaps to canonical key', () => {
  assert.equal(c.normalizeKey('a'), 'a');
  assert.equal(c.normalizeKey('arrowleft'), 'arrowleft');
  assert.ok(c.rebind('jump', 'x'));
  assert.equal(c.normalizeKey('x'), ' ');
  assert.equal(c.normalizeKey(' '), '\u0000', 'old default jump key is disabled');
  assert.equal(c.normalizeKey('w'), 'w', 'alternate jump keys still work');
});

test('rebinding onto a used key swaps, and reserved keys are rejected', () => {
  assert.ok(c.rebind('left', 'd'));
  assert.equal(c.getBinding('left'), 'd');
  assert.equal(c.getBinding('right'), 'a');
  assert.equal(c.rebind('time', 'enter'), false);
  c.resetBindings();
  assert.equal(c.getBinding('jump'), ' ');
});

test('difficulty scales the timeline cooldown', () => {
  c.setDifficulty('easy'); assert.equal(c.cooldownScale(), 0.5);
  c.setDifficulty('hard'); assert.equal(c.cooldownScale(), 1.5);
  c.setDifficulty('normal'); assert.equal(c.cooldownScale(), 1);
});

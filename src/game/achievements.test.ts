import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
const a = await import('./achievements');

test('achievements unlock once and persist', () => {
  const p: any = { testedTimelineSwitch: true };
  assert.deepEqual(a.evaluateAchievements(p).map(x => x.id), ['first_shift']);
  assert.deepEqual(a.evaluateAchievements(p), [], 'does not unlock twice');
  assert.deepEqual(a.getUnlocked(), ['first_shift']);
});

test('ending achievements use stats and ending type', () => {
  const stats = { timeElapsed: 1800, timelineSwitches: 10, puzzlesSolvedCount: 5, notesRead: 4, chaseRetries: 0 };
  const ids = a.evaluateAchievements({} as any, stats, 'ACCEPT_TRUTH').map(x => x.id);
  assert.ok(ids.includes('ending_accept') && ids.includes('no_retry') && ids.includes('swift'));
  assert.ok(!ids.includes('ending_eternal'));
});

test('achievement ids are unique', () => {
  assert.equal(new Set(a.ACHIEVEMENTS.map(x => x.id)).size, a.ACHIEVEMENTS.length);
});

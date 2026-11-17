/** Player-configurable key bindings and difficulty, persisted in localStorage. */
export type Action = 'left' | 'right' | 'jump' | 'time' | 'interact' | 'pulse' | 'dash';
export type Difficulty = 'easy' | 'normal' | 'hard';

/** Canonical keys the engine understands for each action (the defaults). */
export const DEFAULT_KEYS: Record<Action, string> = { left: 'a', right: 'd', jump: ' ', time: 'q', interact: 'e', pulse: 'r', dash: 'shift' };
export const ACTION_LABELS: Record<Action, string> = { left: 'Đi trái', right: 'Đi phải', jump: 'Nhảy', time: 'Đổi thời gian', interact: 'Tương tác', pulse: 'Sóng chuông', dash: 'Lướt' };
export const ACTIONS = Object.keys(DEFAULT_KEYS) as Action[];
const KEY = 'THE_LAST_CHIME_CONTROLS';
/** Keys that are never rebindable. */
const RESERVED = new Set(['escape', 'tab', 'enter', 'h']);

interface Stored { keys: Partial<Record<Action, string>>; difficulty: Difficulty }
let state: Stored = load();

function load(): Stored {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw === 'object') {
      const keys: Partial<Record<Action, string>> = {};
      for (const a of ACTIONS) if (typeof raw.keys?.[a] === 'string' && raw.keys[a].length) keys[a] = raw.keys[a];
      return { keys, difficulty: ['easy', 'normal', 'hard'].includes(raw.difficulty) ? raw.difficulty : 'normal' };
    }
  } catch { /* storage unavailable */ }
  return { keys: {}, difficulty: 'normal' };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }

export const getBinding = (a: Action) => state.keys[a] ?? DEFAULT_KEYS[a];
export const getDifficulty = () => state.difficulty;
export function setDifficulty(d: Difficulty) { state = { ...state, difficulty: d }; save(); }
/** Multiplier on the timeline-switch cooldown. */
export const cooldownScale = () => ({ easy: 0.5, normal: 1, hard: 1.5 }[state.difficulty]);

/** Returns the action previously using `key`, if any (it is swapped to the old key of `action`). */
export function rebind(action: Action, key: string): boolean {
  const k = key.toLowerCase();
  if (RESERVED.has(k)) return false;
  const other = ACTIONS.find(a => a !== action && getBinding(a) === k);
  const prev = getBinding(action);
  const keys = { ...state.keys, [action]: k };
  if (other) keys[other] = prev;
  state = { ...state, keys };
  save();
  return true;
}
export function resetBindings() { state = { ...state, keys: {} }; save(); }
export const keyLabel = (k: string) => k === ' ' ? 'Space' : k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1);

/** Dialogue follows the two configured actions; Enter remains a menu alternative. */
export function isDialogueAdvanceKey(key:string):boolean{
 const physical=key.toLowerCase();
 return physical==='enter'||physical===getBinding('interact')||physical===getBinding('jump');
}

/**
 * Translate a physical key to the canonical key the engine listens to.
 * A rebound action's old default key stops working; arrows and other keys pass through.
 */
export function normalizeKey(key: string): string {
  for (const a of ACTIONS) if (getBinding(a) === key) return DEFAULT_KEYS[a];
  for (const a of ACTIONS) if (DEFAULT_KEYS[a] === key && getBinding(a) !== key) return '\u0000';
  return key;
}

import { cp, rm } from 'node:fs/promises';
import { build } from 'vite';

// Exclude source artwork that the game does not use at runtime.
await build({ base: './' });
for (const group of ['aistudio', 'art', 'mossy']) {
  await rm(`dist/assets/${group}`, { recursive: true });
}
for (const asset of [
  'loading/workshop-reference.png',
  'menu/title-reference.png',
  'pixel/an-v2.jpg',
  'pixel/an-walk-smooth.png',
  'pixel/an.jpg',
  'story/opening-animations.png',
  'story/opening-scenes.png',
]) {
  await rm(`dist/assets/${asset}`);
}
await cp('p2game/p2game.json', 'dist/p2game.json');
await cp('p2game/store', 'dist/store', { recursive: true });

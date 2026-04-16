/**
 * Seeded pseudo-random number generator (mulberry32).
 * Same seed → same sequence across all browsers/runs.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SeededItem {
  id: number;
  name: string;
  message: string;
  height: number;
  color: string;
}

const NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi'];
const MESSAGES = [
  'Just shipped a new feature 🚀',
  'Code review looks good ✅',
  'Working on the canvas renderer',
  'Fixed the scroll bug 🐛',
  'Deployed to production',
  'Updated the docs site',
  'Optimized render pipeline ⚡',
  'Refactored the layout engine',
  'Added unit tests for the parser',
  'Investigating memory leak',
  'Reviewing pull request #42',
  'Benchmarking scroll performance',
];
const COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#2563eb'];

/**
 * Generate a deterministic list of items with dynamic heights.
 * Heights range from 40-200px using seeded PRNG.
 * Same seed always produces the same items.
 */
export function generateSeededItems(count: number, seed = 12345): SeededItem[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: NAMES[i % NAMES.length],
    message: MESSAGES[Math.floor(rand() * MESSAGES.length)],
    height: Math.floor(rand() * 161) + 40, // 40-200px
    color: COLORS[i % COLORS.length],
  }));
}

/**
 * Pre-computed item heights for react-window's itemSize callback.
 * Must use same seed to match react-pxl rendering.
 */
export function getItemHeights(count: number, seed = 12345): number[] {
  return generateSeededItems(count, seed).map(item => item.height);
}

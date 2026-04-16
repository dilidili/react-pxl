import React from 'react';

/**
 * Seeded PRNG (mulberry32) — same seed, same sequence everywhere.
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

function generateItems(count: number, seed = 12345) {
  const rand = mulberry32(seed);
  const names = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi'];
  const messages = [
    'Just shipped a new feature 🚀',
    'Code review looks good ✅',
    'Working on the canvas renderer',
    'Fixed the scroll bug 🐛',
    'Deployed to production',
    'Updated the docs site',
    'Optimized render pipeline ⚡',
    'Refactored the layout engine',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: names[i % names.length],
    message: messages[Math.floor(rand() * messages.length)],
    height: Math.floor(rand() * 161) + 40, // 40-200px
    color: ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#2563eb'][i % 8],
  }));
}

/**
 * Scroll test component: fixed-height container with overflow:scroll
 * containing items with seeded dynamic heights for reproducible benchmarks.
 */
export function ScrollTestComponent({ itemCount = 1000 }: { itemCount?: number }) {
  const items = generateItems(itemCount);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: 800,
      height: 600,
      backgroundColor: '#f8fafc',
      padding: 20,
      gap: 12,
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
        Scroll Test ({itemCount} items)
      </h1>

      {/* Scrollable container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'scroll' as any,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        gap: 8,
      }}>
        {items.map(item => (
          <div
            key={item.id}
            data-index={item.id}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              height: item.height,
              backgroundColor: item.id % 2 === 0 ? '#f1f5f9' : '#e2e8f0',
              padding: 16,
              borderRadius: 6,
              gap: 12,
            }}
          >
            <span style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#3b82f6',
              width: 40,
            }}>
              {String(item.id + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 14, color: '#334155' }}>
              {`Item #${item.id + 1} — h:${item.height}px — ${item.message}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

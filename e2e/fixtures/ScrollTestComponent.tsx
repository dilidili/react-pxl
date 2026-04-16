import React from 'react';

/**
 * Scroll test component: a fixed-height container with overflow:scroll
 * containing many items for infinite list validation.
 * Item count is configurable via window.__SCROLL_TEST_ITEM_COUNT (default 1000).
 */
export function ScrollTestComponent({ itemCount = 1000 }: { itemCount?: number }) {
  const items = Array.from({ length: itemCount }, (_, i) => i);

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
        {items.map(i => (
          <div
            key={i}
            data-index={i}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: i % 2 === 0 ? '#f1f5f9' : '#e2e8f0',
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
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 14, color: '#334155' }}>
              {`Item number ${i + 1} — scroll to see more content`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

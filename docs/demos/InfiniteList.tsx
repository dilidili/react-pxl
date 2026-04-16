import React from 'react';

/**
 * Scrollable list with 200 items — plain React list rendering.
 * Demonstrates that react-pxl handles overflow: scroll with many items.
 */
export function InfiniteList() {
  const items = Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    name: ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi'][i % 8],
    message: [
      'Just shipped a new feature 🚀',
      'Code review looks good ✅',
      'Working on the canvas renderer',
      'Merged PR #' + (100 + i),
      'Fixed the scroll bug 🐛',
      'Deployed to production',
      'Updated the docs site',
      'Optimized render pipeline ⚡',
    ][i % 8],
    time: `${(i % 12) + 1}:${String(i % 60).padStart(2, '0')} ${i % 2 === 0 ? 'AM' : 'PM'}`,
    color: ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#2563eb'][i % 8],
  }));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: 420,
      height: 520,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
        padding: 20, paddingBottom: 12,
      }}>
        <span style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>Activity Feed</span>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>200 items</span>
      </div>

      {/* Scrollable list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'scroll' as any,
        padding: 12,
        paddingTop: 0,
        gap: 6,
      }}>
        {items.map((item) => (
          <div key={item.id} style={{
            display: 'flex', flexDirection: 'row',
            padding: 12, gap: 10, alignItems: 'center',
            backgroundColor: item.id % 2 === 0 ? '#f8fafc' : '#ffffff',
            borderRadius: 10,
          }}>
            {/* Avatar circle */}
            <div style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: item.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 14, fontWeight: 'bold', color: '#ffffff' }}>
                {item.name[0]}
              </span>
            </div>
            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2 }}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{item.name}</span>
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>{item.time}</span>
              </div>
              <span style={{ fontSize: 12, color: '#64748b' }}>{item.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

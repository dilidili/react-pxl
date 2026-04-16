import React from 'react';
import { VariableSizeList as List } from 'react-window';
import { generateSeededItems, getItemHeights, type SeededItem } from './seeded-items';

/**
 * react-window benchmark list — 1000 items with dynamic heights.
 * Requires VariableSizeList, itemSize callback, and render-prop pattern.
 */
export function BenchmarkListRW({ itemCount = 1000, seed = 12345 }: { itemCount?: number; seed?: number }) {
  const items = React.useMemo(() => generateSeededItems(itemCount, seed), [itemCount, seed]);
  const heights = React.useMemo(() => getItemHeights(itemCount, seed), [itemCount, seed]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: 420,
      height: 520,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
        padding: 16, paddingBottom: 8,
        borderBottom: '1px solid #e2e8f0',
      }}>
        <span style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>
          react-window
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {itemCount} items · dynamic heights
        </span>
      </div>

      {/* Virtualized list — requires VariableSizeList + render callback */}
      <List
        height={520 - 49}
        width={420}
        itemCount={itemCount}
        itemSize={(index) => heights[index]}
        style={{ padding: 8 }}
      >
        {({ index, style }) => {
          const item = items[index];
          return (
            <div style={{
              ...style,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              gap: 10,
              backgroundColor: item.id % 2 === 0 ? '#f8fafc' : '#ffffff',
              borderRadius: 8,
              boxSizing: 'border-box',
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff' }}>
                  {item.name[0]}
                </span>
              </div>
              {/* Content */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>
                  {item.name}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {item.message}
                </span>
                <span style={{ fontSize: 10, color: '#cbd5e1' }}>
                  Item #{item.id + 1} · height: {item.height}px
                </span>
              </div>
            </div>
          );
        }}
      </List>
    </div>
  );
}

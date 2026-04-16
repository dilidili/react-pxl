import React from 'react';
import { generateSeededItems, type SeededItem } from './seeded-items';

/**
 * react-pxl benchmark list — 1000 items with dynamic heights.
 * Standard JSX, no virtualization API, just overflow: scroll.
 */
export function BenchmarkListPxl({ itemCount = 1000, seed = 12345 }: { itemCount?: number; seed?: number }) {
  const items = React.useMemo(() => generateSeededItems(itemCount, seed), [itemCount, seed]);

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
          react-pxl
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {itemCount} items · dynamic heights
        </span>
      </div>

      {/* Scrollable list — identical syntax to a normal list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'scroll' as any,
        padding: 8,
        gap: 4,
      }}>
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: SeededItem }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      height: item.height,
      padding: 12,
      gap: 10,
      backgroundColor: item.id % 2 === 0 ? '#f8fafc' : '#ffffff',
      borderRadius: 8,
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
}

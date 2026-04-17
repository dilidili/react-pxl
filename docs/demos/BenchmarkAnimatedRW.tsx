import React, { useState, useMemo, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import { generateSeededItems, getItemHeights } from './seeded-items';
import { computeItemEffects, type ActiveEffects, ALL_EFFECTS } from './scroll-effects';

/**
 * react-window animated benchmark — 1000 items with scroll-linked per-item effects.
 * Every scroll event triggers setState → re-render → DOM style mutations for all
 * visible items. This demonstrates the overhead of per-frame style updates in DOM.
 */
export function BenchmarkAnimatedRW({ itemCount = 1000, seed = 12345 }: { itemCount?: number; seed?: number }) {
  const items = useMemo(() => generateSeededItems(itemCount, seed), [itemCount, seed]);
  const heights = useMemo(() => getItemHeights(itemCount, seed), [itemCount, seed]);

  const [scrollTop, setScrollTop] = useState(0);
  const [activeEffects, setActiveEffects] = useState<ActiveEffects>(ALL_EFFECTS);

  // Pre-compute cumulative Y positions for effect calculations
  const positions = useMemo(() => {
    let y = 0;
    return heights.map(h => { const pos = y; y += h; return pos; });
  }, [heights]);

  const viewportH = 520 - 49 - 44; // total - header - toggle bar

  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    setScrollTop(scrollOffset);
  }, []);

  const toggle = (key: keyof ActiveEffects) => {
    setActiveEffects(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
          react-window (animated)
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {itemCount} items
        </span>
      </div>

      {/* Toggle bar */}
      <div style={{
        display: 'flex', flexDirection: 'row',
        padding: '6px 12px', gap: 6,
        borderBottom: '1px solid #f1f5f9',
      }}>
        {(['opacity', 'scale', 'parallax', 'colorShift'] as const).map(key => (
          <button key={key} onClick={() => toggle(key)} style={{
            padding: '3px 10px', borderRadius: 12, fontSize: 11,
            fontWeight: 'bold', cursor: 'pointer', border: 'none',
            backgroundColor: activeEffects[key] ? '#4f46e5' : '#f1f5f9',
            color: activeEffects[key] ? '#fff' : '#94a3b8',
          }}>
            {key === 'colorShift' ? 'Color' : key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {/* Virtualized list */}
      <List
        height={viewportH}
        width={420}
        itemCount={itemCount}
        itemSize={(index) => heights[index]}
        onScroll={handleScroll}
        style={{ padding: 8 }}
      >
        {({ index, style }) => {
          const item = items[index];
          const effects = computeItemEffects(
            positions[index], item.height, scrollTop, viewportH, item.color, activeEffects,
          );

          return (
            <div style={{
              ...style,
              display: 'flex', flexDirection: 'row', alignItems: 'center',
              padding: 12, gap: 10,
              backgroundColor: effects.backgroundColor,
              opacity: effects.opacity,
              transform: `translateY(${effects.offsetY}px) scale(${effects.scaleX})`,
              borderRadius: 8, boxSizing: 'border-box',
              transition: 'none',
            }}>
              {/* Avatar circle */}
              <div style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>
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

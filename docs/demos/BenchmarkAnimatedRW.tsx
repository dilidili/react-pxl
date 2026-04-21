import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import { generateSeededItems } from './seeded-items';

const CONTAINER_WIDTH = 420;
const CONTAINER_HEIGHT = 520;
const HEADER_HEIGHT = 49;
const VIEWPORT_HEIGHT = CONTAINER_HEIGHT - HEADER_HEIGHT;
const BASE_HEIGHT = 60;
const ITEM_GAP = 4;

/**
 * Height scale based on distance from viewport center.
 * Center items expand (2.0×), edge items compress (0.6×), with quadratic easing.
 */
function computeHeightScale(itemY: number, scrollTop: number, viewportH: number): number {
  const itemCenter = itemY + BASE_HEIGHT / 2 - scrollTop;
  const viewportCenter = viewportH / 2;
  const halfViewport = viewportH / 2;
  const distance = (itemCenter - viewportCenter) / halfViewport;
  const absD = Math.min(Math.abs(distance), 1);
  return 0.6 + (1 - absD * absD) * 1.4;
}

/**
 * react-window animated benchmark — 1000 items with height magnification.
 *
 * Every scroll frame triggers: setState → re-render → DOM style mutations for all
 * visible items + resetAfterIndex(0) to invalidate react-window's size cache.
 * This demonstrates the overhead of per-frame style + layout mutations in DOM.
 */
export function BenchmarkAnimatedRW({ itemCount = 1000, seed = 12345 }: { itemCount?: number; seed?: number }) {
  const items = useMemo(() => generateSeededItems(itemCount, seed), [itemCount, seed]);

  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef<List>(null);

  // Cumulative Y positions using uniform base height
  const positions = useMemo(() => {
    let y = 0;
    return Array.from({ length: itemCount }, () => {
      const pos = y;
      y += BASE_HEIGHT + ITEM_GAP;
      return pos;
    });
  }, [itemCount]);

  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    setScrollTop(scrollOffset);
  }, []);

  // Invalidate react-window's size cache on every scroll frame (VERY expensive in DOM)
  useEffect(() => {
    listRef.current?.resetAfterIndex(0, false);
  }, [scrollTop]);

  const getItemSize = useCallback((index: number) => {
    const heightScale = computeHeightScale(positions[index], scrollTop, VIEWPORT_HEIGHT);
    return Math.max(28, BASE_HEIGHT * heightScale);
  }, [positions, scrollTop]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: CONTAINER_WIDTH,
      height: CONTAINER_HEIGHT,
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
          react-window (DOM)
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {itemCount} items · height magnification
        </span>
      </div>

      {/* Virtualized list */}
      <List
        ref={listRef}
        height={VIEWPORT_HEIGHT}
        width={CONTAINER_WIDTH}
        itemCount={itemCount}
        itemSize={getItemSize}
        onScroll={handleScroll}
        style={{ padding: 8 }}
      >
        {({ index, style }) => {
          const item = items[index];
          const heightScale = computeHeightScale(positions[index], scrollTop, VIEWPORT_HEIGHT);
          const dynamicHeight = Math.max(28, BASE_HEIGHT * heightScale);

          return (
            <div style={{
              ...style,
              display: 'flex', flexDirection: 'row', alignItems: 'center',
              padding: 12, gap: 10,
              height: dynamicHeight,
              backgroundColor: index % 2 === 0 ? '#f8fafc' : '#ffffff',
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
                {dynamicHeight > 50 && (
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {item.message}
                  </span>
                )}
                {dynamicHeight > 70 && (
                  <span style={{ fontSize: 10, color: '#cbd5e1' }}>
                    Item #{item.id + 1} · h: {Math.round(dynamicHeight)}px
                  </span>
                )}
              </div>
            </div>
          );
        }}
      </List>
    </div>
  );
}

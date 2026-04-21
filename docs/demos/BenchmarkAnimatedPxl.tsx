import React from 'react';
import { generateSeededItems, type SeededItem } from './seeded-items';

const CONTAINER_WIDTH = 420;
const CONTAINER_HEIGHT = 520;
const HEADER_HEIGHT = 49;
const VIEWPORT_HEIGHT = CONTAINER_HEIGHT - HEADER_HEIGHT;
const ITEM_GAP = 4;
const BASE_HEIGHT = 60;

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
 * react-pxl animated scroll benchmark — 1000 items with height magnification.
 *
 * Items near the viewport center expand; edge items compress.
 * Each scroll frame triggers: setState → PxlNode prop update → Yoga relayout → Canvas redraw.
 * No DOM nodes are created or mutated.
 */
export function BenchmarkAnimatedPxl({ itemCount = 1000, seed = 12345 }: { itemCount?: number; seed?: number }) {
  const scrollRef = React.useRef<any>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  const items = React.useMemo(() => generateSeededItems(itemCount, seed), [itemCount, seed]);

  // Cumulative Y positions using uniform base height
  const positions = React.useMemo(() => {
    let y = 0;
    return items.map(() => {
      const pos = y;
      y += BASE_HEIGHT + ITEM_GAP;
      return pos;
    });
  }, [items]);

  // Poll scrollTop from the PxlNode via rAF for reliable scroll tracking
  React.useEffect(() => {
    let rafId: number;
    const tick = () => {
      if (scrollRef.current) {
        const newTop = scrollRef.current.scrollTop ?? 0;
        setScrollTop((prev: number) => (prev === newTop ? prev : newTop));
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

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
          {`react-pxl (canvas)`}
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {`${itemCount} items · height magnification`}
        </span>
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'scroll' as any,
          padding: 8,
          gap: ITEM_GAP,
        }}
      >
        {items.map((item, i) => {
          const heightScale = computeHeightScale(positions[i], scrollTop, VIEWPORT_HEIGHT);
          const dynamicHeight = Math.max(28, BASE_HEIGHT * heightScale);
          return (
            <ItemRow key={item.id} item={item} dynamicHeight={dynamicHeight} />
          );
        })}
      </div>
    </div>
  );
}

function ItemRow({ item, dynamicHeight }: { item: SeededItem; dynamicHeight: number }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      height: dynamicHeight,
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
        {dynamicHeight > 50 && (
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {item.message}
          </span>
        )}
        {dynamicHeight > 70 && (
          <span style={{ fontSize: 10, color: '#cbd5e1' }}>
            {`Item #${item.id + 1} · h: ${Math.round(dynamicHeight)}px`}
          </span>
        )}
      </div>
    </div>
  );
}

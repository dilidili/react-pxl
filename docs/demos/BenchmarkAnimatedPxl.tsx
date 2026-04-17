import React from 'react';
import { generateSeededItems, type SeededItem } from './seeded-items';
import { computeItemEffects, type ActiveEffects, type ItemEffects, ALL_EFFECTS } from './scroll-effects';

const EFFECT_KEYS: (keyof ActiveEffects)[] = ['opacity', 'scale', 'parallax', 'colorShift'];
const EFFECT_LABELS: Record<keyof ActiveEffects, string> = {
  opacity: 'Opacity',
  scale: 'Scale',
  parallax: 'Parallax',
  colorShift: 'Color Shift',
};

const CONTAINER_WIDTH = 420;
const CONTAINER_HEIGHT = 520;
const HEADER_HEIGHT = 49;
const TOGGLE_BAR_HEIGHT = 44;
const VIEWPORT_HEIGHT = CONTAINER_HEIGHT - HEADER_HEIGHT - TOGGLE_BAR_HEIGHT;
const ITEM_GAP = 4;

/**
 * react-pxl animated scroll benchmark — 1000 items with per-item visual effects.
 *
 * Effects are computed from each item's distance to the viewport center.
 * In react-pxl this is cheap: scroll → setState → PxlNode property update → Canvas redraw (no DOM).
 */
export function BenchmarkAnimatedPxl({ itemCount = 1000, seed = 12345 }: { itemCount?: number; seed?: number }) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [activeEffects, setActiveEffects] = React.useState<ActiveEffects>({ ...ALL_EFFECTS });

  const items = React.useMemo(() => generateSeededItems(itemCount, seed), [itemCount, seed]);

  // Pre-compute cumulative Y positions for effect calculation
  const positions = React.useMemo(() => {
    let y = 0;
    return items.map((item) => {
      const pos = y;
      y += item.height + ITEM_GAP;
      return pos;
    });
  }, [items]);

  const handleScroll = (e: any) => {
    setScrollTop(e.target?.scrollTop ?? 0);
  };

  const toggleEffect = (key: keyof ActiveEffects) => {
    setActiveEffects((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
          {`react-pxl (animated)`}
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {`${itemCount} items · scroll effects`}
        </span>
      </div>

      {/* Effect toggle bar */}
      <div style={{
        display: 'flex', flexDirection: 'row',
        padding: 8, gap: 6,
        alignItems: 'center',
      }}>
        {EFFECT_KEYS.map((key) => (
          <EffectToggle
            key={key}
            label={EFFECT_LABELS[key]}
            active={activeEffects[key]}
            onToggle={() => toggleEffect(key)}
          />
        ))}
      </div>

      {/* Scrollable list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'scroll' as any,
          padding: 8,
          gap: ITEM_GAP,
        }}
        onScroll={handleScroll}
      >
        {items.map((item, i) => {
          const effects = computeItemEffects(
            positions[i], item.height, scrollTop, VIEWPORT_HEIGHT, item.color, activeEffects,
          );
          return (
            <AnimatedItemRow key={item.id} item={item} effects={effects} />
          );
        })}
      </div>
    </div>
  );
}

function EffectToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        padding: '4px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: active ? '#4f46e5' : 'transparent',
        color: active ? '#fff' : '#94a3b8',
        border: active ? 'none' : '1px solid #e2e8f0',
        cursor: 'pointer',
      }}
    >
      {label}
    </div>
  );
}

function AnimatedItemRow({ item, effects }: { item: SeededItem; effects: ItemEffects }) {
  // Simulate scale via horizontal padding (no CSS transform in react-pxl)
  const scalePad = (1 - effects.scaleX) * CONTAINER_WIDTH / 2;

  return (
    <div style={{
      marginTop: effects.offsetY,
      paddingLeft: scalePad,
      paddingRight: scalePad,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: item.height,
        padding: 12,
        gap: 10,
        opacity: effects.opacity,
        backgroundColor: effects.backgroundColor,
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
            {`Item #${item.id + 1} · height: ${item.height}px`}
          </span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export function TailwindDemo() {
  return (
    <div className="flex flex-col w-full h-full bg-slate-50 p-5 gap-4"
      style={{ width: 600, height: 400, fontFamily: 'Arial, sans-serif' }}>
      <h1 className="text-xl font-bold text-slate-900" style={{ margin: 0 }}>
        Tailwind Classes
      </h1>
      <p className="text-sm text-slate-500" style={{ margin: 0 }}>
        react-pxl parses Tailwind utility classes at runtime
      </p>

      {/* Color palette */}
      <div className="flex flex-row gap-2">
        {['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-pink-500'].map((cls) => (
          <div key={cls} className={`${cls} rounded-lg flex-1`} style={{ height: 40 }} />
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-row gap-3" style={{ flex: 1 }}>
        <div className="flex-1 flex flex-col p-4 bg-blue-500 rounded-xl gap-2">
          <span className="text-base font-bold text-white">Card A</span>
          <span className="text-xs text-blue-100">
            Styled with className only — no inline styles needed
          </span>
        </div>
        <div className="flex-1 flex flex-col p-4 bg-emerald-500 rounded-xl gap-2">
          <span className="text-base font-bold text-white">Card B</span>
          <span className="text-xs text-emerald-100">
            Supports colors, spacing, typography, borders, and more
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-row gap-2 items-center">
        <span className="text-xs font-bold text-white bg-blue-500 rounded-full px-3 py-1">React</span>
        <span className="text-xs font-bold text-white bg-emerald-500 rounded-full px-3 py-1">Canvas</span>
        <span className="text-xs font-bold text-white bg-violet-500 rounded-full px-3 py-1">Tailwind</span>
        <span className="text-xs font-bold text-white bg-amber-500 rounded-full px-3 py-1">Flexbox</span>
        <span className="text-xs font-bold text-white bg-pink-500 rounded-full px-3 py-1">Fast</span>
      </div>
    </div>
  );
}

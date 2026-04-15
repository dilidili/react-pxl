import React, { useState } from 'react';
import { render } from '@react-pxl/reconciler';

/**
 * Demo: Standard HTML JSX rendered entirely to canvas.
 * This is the SAME code you'd write for react-dom — no custom components needed.
 * Just swap ReactDOM.render() → ReactCanvas.render().
 */
function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: 24, gap: 16 }}>
      {/* Header — same as you'd write for react-dom */}
      <header className="bg-slate-800 p-5 rounded-xl">
        <h1 className="text-2xl text-white">react-pxl</h1>
        <p className="text-sm text-slate-400">
          React → Canvas. Same JSX, zero migration.
        </p>
      </header>

      {/* Cards row — using Tailwind-like classes */}
      <div className="flex flex-row gap-3">
        <div className="flex-1 bg-blue-500 p-4 rounded-lg">
          <strong className="text-base text-white">Flexbox Layout</strong>
          <small className="text-blue-100">Powered by Yoga WASM</small>
        </div>

        <div className="flex-1 bg-emerald-500 p-4 rounded-lg">
          <strong className="text-base text-white">Canvas 2D</strong>
          <small className="text-emerald-100">60fps rendering</small>
        </div>

        <div className="flex-1 bg-violet-500 p-4 rounded-lg">
          <strong className="text-base text-white">DOM Compatible</strong>
          <small className="text-violet-100">Same JSX, no rewrite</small>
        </div>
      </div>

      {/* Counter — inline styles work too, just like react-dom */}
      <div style={{
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
      }}>
        <h2 style={{ fontSize: 48, fontWeight: 'bold', color: '#1e293b' }}>
          {String(count)}
        </h2>
        <p className="text-sm text-slate-500">Click the button to increment</p>
        <button
          className="bg-blue-500 px-6 py-2 rounded-md"
          onClick={() => setCount(c => c + 1)}
        >
          <span className="text-sm font-bold text-white">Increment</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="items-center p-2">
        <p className="text-xs text-slate-400">
          No DOM elements were harmed. Same JSX as react-dom.
        </p>
      </footer>
    </div>
  );
}

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<App />, canvas);

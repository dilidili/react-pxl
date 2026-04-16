import React from 'react';
import { createRoot } from 'react-dom/client';
import { BenchmarkListRW } from './BenchmarkListRW';
import { FpsMeter } from './fps-meter';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<BenchmarkListRW itemCount={1000} seed={12345} />);

// Start FPS meter
const overlay = document.getElementById('fps-overlay')!;
const meter = new FpsMeter(overlay);
meter.start();

// Expose for E2E tests
(window as any).__fpsMeter = meter;

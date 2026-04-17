import React from 'react';
import { createRoot } from 'react-dom/client';
import { BenchmarkAnimatedRW } from './BenchmarkAnimatedRW';
import { FpsMeter } from './fps-meter';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<BenchmarkAnimatedRW itemCount={1000} seed={12345} />);

const overlay = document.getElementById('fps-overlay')!;
const meter = new FpsMeter(overlay);
meter.start();

(window as any).__fpsMeter = meter;

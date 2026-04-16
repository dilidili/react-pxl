import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { BenchmarkListPxl } from './BenchmarkListPxl';
import { FpsMeter } from './fps-meter';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<BenchmarkListPxl itemCount={1000} seed={12345} />, canvas);

// Start FPS meter
const overlay = document.getElementById('fps-overlay')!;
const meter = new FpsMeter(overlay);
meter.start();

// Expose for E2E tests
(window as any).__fpsMeter = meter;

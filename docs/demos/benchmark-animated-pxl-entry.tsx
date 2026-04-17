import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { BenchmarkAnimatedPxl } from './BenchmarkAnimatedPxl';
import { FpsMeter } from './fps-meter';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<BenchmarkAnimatedPxl itemCount={1000} seed={12345} />, canvas);

const overlay = document.getElementById('fps-overlay')!;
const meter = new FpsMeter(overlay);
meter.start();

(window as any).__fpsMeter = meter;

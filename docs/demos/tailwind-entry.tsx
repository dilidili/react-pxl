import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { TailwindDemo } from './TailwindDemo';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<TailwindDemo />, canvas);

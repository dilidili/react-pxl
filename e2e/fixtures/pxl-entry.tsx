import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { TestComponent } from './TestComponent';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<TestComponent />, canvas);

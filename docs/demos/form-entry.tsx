import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { FormDemo } from './FormDemo';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<FormDemo />, canvas);

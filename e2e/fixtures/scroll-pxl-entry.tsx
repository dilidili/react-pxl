import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { ScrollTestComponent } from './ScrollTestComponent';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<ScrollTestComponent />, canvas);

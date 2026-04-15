import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { ImageDemo } from './ImageDemo';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<ImageDemo />, canvas);

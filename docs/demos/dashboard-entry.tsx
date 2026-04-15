import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { DashboardDemo } from './DashboardDemo';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<DashboardDemo />, canvas);

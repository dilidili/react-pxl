import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { ScrollTestComponent } from './ScrollTestComponent';

const canvas = document.getElementById('root') as HTMLCanvasElement;
const itemCount = (window as any).__SCROLL_TEST_ITEM_COUNT ?? 1000;
render(<ScrollTestComponent itemCount={itemCount} />, canvas);

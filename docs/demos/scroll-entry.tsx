import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { InfiniteList } from './InfiniteList';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<InfiniteList />, canvas);

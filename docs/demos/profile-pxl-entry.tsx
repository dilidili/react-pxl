import React from 'react';
import { render } from '../../packages/reconciler/src/renderer';
import { ProfileCard } from './ProfileCard';

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<ProfileCard />, canvas);

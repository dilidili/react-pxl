import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProfileCard } from './ProfileCard';

const root = createRoot(document.getElementById('root')!);
root.render(<ProfileCard />);

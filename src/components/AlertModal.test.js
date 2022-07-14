/* globals test */

import React from 'react';
import AlertModal from './AlertModal';
import { createRoot } from 'react-dom/client';

test('renders AlertModal', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<AlertModal />);
});

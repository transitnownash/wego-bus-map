/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import StopMarker from './StopMarker';
import stopFixture from '../fixtures/stop-DOVDICWF.json';

test('renders StopMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<StopMarker stop={stopFixture} />);
});

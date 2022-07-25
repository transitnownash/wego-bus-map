/* globals test */

import React from 'react';
import StopMarker from './StopMarker';
import { createRoot } from 'react-dom/client';
import stopFixture from '../fixtures/stop-DOVDICWF.json';

test('renders StopMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<StopMarker stop={stopFixture} />);
});

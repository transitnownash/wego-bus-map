/* globals test */

import React from 'react';
import StopAccessibilityInformation from './StopAccessibilityInformation';
import { createRoot } from 'react-dom/client';

test('renders StopAccessibilityInformation', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const stop = {
    "id": 46127,
    "stop_gid": "DOVDICWF",
    "stop_code": "DOVDICWF",
    "stop_name": "DOVERSIDE DR & DICKERSON PIKE WB",
    "stop_desc": null,
    "stop_lat": "36.24406",
    "stop_lon": "-86.757403",
    "zone_gid": null,
    "stop_url": null,
    "location_type": null,
    "parent_station": null,
    "stop_timezone": null,
    "wheelchair_boarding": "0"
  };
  root.render(<StopAccessibilityInformation stop={stop} />);
});

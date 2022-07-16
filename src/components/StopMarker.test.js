/* globals test */

import React from 'react';
import StopMarker from './StopMarker';
import { createRoot } from 'react-dom/client';

test('renders StopMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const stop = {
    "id": 44875,
    "stop_gid": "10AHERNN",
    "stop_code": "10AHERNN",
    "stop_name": "10TH AVE N & HERMAN ST NB",
    "stop_desc": "10TH AV N & HERMAN ST",
    "stop_lat": "36.168831",
    "stop_lon": "-86.792339",
    "zone_gid": null,
    "stop_url": null,
    "location_type": null,
    "parent_station": null,
    "stop_timezone": null,
    "wheelchair_boarding": null
  }
  ;
  root.render(<StopMarker stop={stop} />);
});

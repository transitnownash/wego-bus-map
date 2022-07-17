/* globals test */

import React from 'react';
import TimePoint from './TimePoint';
import { createRoot } from 'react-dom/client';

test('renders TimePoint', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const scheduleData = {
    "id": 5022349,
    "trip_gid": "265838",
    "trip_id": 153226,
    "arrival_time": " 4:20:00",
    "departure_time": " 4:20:00",
    "stop_gid": "DOVDICWF",
    "stop_id": 46127,
    "stop_sequence": 1,
    "stop_headsign": null,
    "pickup_type": "0",
    "drop_off_type": "0",
    "shape_dist_traveled": null,
    "timepoint": "1",
    "stop": {
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
    }
  };
  root.render(<TimePoint scheduleData={scheduleData} />);
});

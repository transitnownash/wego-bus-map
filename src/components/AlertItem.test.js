/* globals test */

import React from 'react';
import AlertItem from './AlertItem';
import { createRoot } from 'react-dom/client';

test('renders AlertItem', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const alert = {
    "id": "35399",
    "alert": {
      "active_period": [
        {
          "start": 1649057040,
          "end": 32503701600
        }
      ],
      "informed_entity": [
        {
          "route_id": "79"
        }
      ],
      "cause": "Construction",
      "effect": "Detour",
      "header_text": {
        "translation": [
          {
            "text": "Detour in effect on route 79 SKYLINE NORTHBOUND",
            "language": "en"
          }
        ]
      },
      "description_text": {
        "translation": [
          {
            "text": "Detour in effect on route 79 SKYLINE\r\n\r\nRoute 79 NORTHBOUND will detour \r\n\r\nDetour Route 79 from \r\nMadison to N Dickerson\r\nNo service on Skyline Ridge due to construction\r\nFrom Skyline Hospital, continue Doverside \r\nback to Dickerson\r\nR-Dickerson to regular route. ",
            "language": "en"
          }
        ]
      }
    }
  }
  root.render(<AlertItem alert={alert} />);
});

import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

function TimePointLegend() {
  return (
    <div className="small">
      <ul className="list-inline">
        <li className="list-inline-item mb-2"><span className="px-1 border">0:00 AM</span> Scheduled time.</li>
        <li className="list-inline-item mb-2"><strike className="text-muted px-1 border">0:00 AM</strike> Previous scheduled time.</li>
        <li className="list-inline-item mb-2"><strong className="text-primary px-1 border">0:00 AM</strong> Updated time from tracking.</li>
        <li className="list-inline-item mb-2"><strong className="px-1 border"><FontAwesomeIcon icon={faCalendarDay} fixedWidth={true} className="px-3" /></strong> Time spans into the next day.</li>
      </ul>
    </div>
  );
}

export default TimePointLegend;

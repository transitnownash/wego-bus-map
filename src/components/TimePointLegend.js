import React from 'react';

function TimePointLegend() {
  return(
    <div className="small">
      <ul className="list-inline">
        <li className="list-inline-item mb-2"><span className="px-1 border">0:00 AM</span> Time from static schedule information.</li>
        <li className="list-inline-item mb-2"><strike className="text-muted px-1 border">0:00 AM</strike> Static scheduled time has been updated.</li>
        <li className="list-inline-item mb-2"><strong className="text-primary px-1 border">0:00 AM</strong> Updated with realtime trip information.</li>
      </ul>
    </div>
  );
}

export default TimePointLegend;

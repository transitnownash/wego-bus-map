import React, { useEffect, useState } from 'react';
import { REALTIME_DATA_STATUS_CHANGE_EVENT, getIsRealtimeDataAvailable } from '../util';

function RealtimeDataStatusBanner() {
  const [isRealtimeAvailable, setIsRealtimeAvailable] = useState(getIsRealtimeDataAvailable());

  useEffect(() => {
    const handleRealtimeStatusChange = (event) => {
      if (typeof event?.detail?.isRealtimeAvailable === 'boolean') {
        setIsRealtimeAvailable(event.detail.isRealtimeAvailable);
        return;
      }
      setIsRealtimeAvailable(getIsRealtimeDataAvailable());
    };

    window.addEventListener(REALTIME_DATA_STATUS_CHANGE_EVENT, handleRealtimeStatusChange);
    return () => {
      window.removeEventListener(REALTIME_DATA_STATUS_CHANGE_EVENT, handleRealtimeStatusChange);
    };
  }, []);

  if (isRealtimeAvailable) {
    return null;
  }

  return (
    <div className="alert alert-warning text-center mb-0 rounded-0 realtime-status-banner" role="status">
      We&apos;re unable to display real-time updates right now. Times shown are based on the schedule.
    </div>
  );
}

export default RealtimeDataStatusBanner;

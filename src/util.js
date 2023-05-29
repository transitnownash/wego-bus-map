import React from 'react';
import axios from 'axios';

// Wrapper for fetch
export async function getJSON(url, options = {}) {
  const { timeout = 60000 * 2 } = options;
  const response = await axios.get(url, {
    ...options,
    timeout,
  });
  return response.data;
}

// Format a timestamp to human readable
export function renderUnixTimestamp(timestamp, format) {
  if (!timestamp || typeof timestamp === 'undefined') {
    return (<>N/A</>);
  }
  if (!format || typeof format === 'undefined') {
    format = {
      year: '2-digit', day: 'numeric', month: 'numeric', hour: 'numeric', minute: '2-digit',
    };
  }
  const displayTimestamp = new Date(timestamp * 1000).toLocaleString([], format);
  return (
    <span title={timestamp}>{displayTimestamp}</span>
  );
}

// Convert degrees to ordinal direction
export function renderBearing(bearing) {
  if (!bearing || typeof bearing === 'undefined') {
    return (<>N/A</>);
  }
  const val = Math.floor((bearing / 22.5) + 0.5);
  const arr = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE',
    'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW',
    'NW', 'NNW',
  ];
  const bearingDisplay = arr[(val % 16)];
  return (
    <span title={bearing}>{bearingDisplay}</span>
  );
}

// Convert meters per second into miles per hour
export function renderSpeed(speed) {
  if (!speed || typeof speed === 'undefined') {
    return (<>N/A</>);
  }
  const displaySpeed = `${Math.round(speed * 2.2369)} mph`;
  return (
    <span title={speed}>{displaySpeed}</span>
  );
}

// Format shape points for Polyline
export function formatShapePoints(points) {
  return (points.map((p, _i) => [p.lat, p.lon]));
}

// Check if HH:MM:SS is after now
export function isTimeLaterThanNow(time) {
  const now = new Date(Date.now());
  const t1 = new Date(Date.now());
  const [hour, minute, second] = time.split(':');
  t1.setHours(hour);
  t1.setMinutes(minute);
  t1.setSeconds(second);
  return t1 > now;
}

export function isStopTimeUpdateLaterThanNow(stopTime, stopUpdate) {
  let time = 0;

  // Calculate with stopUpdate, if available
  if (JSON.stringify(stopUpdate) !== '{}') {
    if (typeof stopUpdate.departure !== 'undefined') {
      time = stopUpdate.departure.time;
    } else if (typeof stopUpdate.arrival !== 'undefined') {
      time = stopUpdate.arrival.time;
    }
    if (time * 1000 > Date.now()) {
      return true;
    }
    return false;
  }

  // Fall back to scheduled time
  return isTimeLaterThanNow(stopTime.departure_time);
}

// Check if a start and end time in HH:MM contains now
export function isTimeRangeIncludesNow(start_time, end_time) {
  const now = new Date(Date.now());
  const t1 = new Date(Date.now());
  const t2 = new Date(Date.now());
  const [start_hour, start_minute, start_second] = start_time.split(':');
  t1.setHours(start_hour);
  t1.setMinutes(start_minute);
  t1.setSeconds(start_second);
  const [end_hour, end_minute, end_second] = end_time.split(':');
  t2.setHours(end_hour);
  t2.setMinutes(end_minute);
  t2.setSeconds(end_second);
  return (t1 < now && now < t2);
}

// Convert kilometers to miles
export function formatDistanceTraveled(kilometers) {
  if (!kilometers) {
    return 'Start';
  }
  return `${(kilometers * 0.62137).toFixed(2)} mi`;
}

// Format stop time update time
export function formatStopTimeUpdate(stopTimeUpdate) {
  if (typeof stopTimeUpdate.departure !== 'undefined' && typeof stopTimeUpdate.departure.time === 'number') {
    return new Date(stopTimeUpdate.departure.time * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (typeof stopTimeUpdate.arrival !== 'undefined' && typeof stopTimeUpdate.arrival.time === 'number') {
    return new Date(stopTimeUpdate.arrival.time * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return '--';
}

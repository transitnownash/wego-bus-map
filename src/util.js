import React from 'react';
import axios from 'axios';

// Wrapper for fetch
export async function getJSON(url, options={}) {
  const { timeout = 60000 } = options;
  const response = await axios.get(url, {
    ...options,
    timeout: timeout
  });
  return response.data;
}

// Format a timestamp to human readable
export function formatTimestamp(timestamp, format) {
  if (!timestamp || typeof timestamp === 'undefined') {
    return(<>N/A</>);
  }
  if (!format || typeof format === 'undefined') {
    format = {year: '2-digit', day: 'numeric', month: 'numeric', hour: 'numeric', minute:'2-digit'};
  }
  let display_timestamp = new Date(timestamp * 1000).toLocaleString([], format);
  return(
    <span title={timestamp}>{display_timestamp}</span>
  );
}

// Convert degrees to ordinal direction
export function formatBearing(bearing) {
  if (!bearing || typeof bearing === 'undefined') {
    return(<>N/A</>);
  }
  const val = Math.floor((bearing / 22.5) + 0.5);
  const arr = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE',
    'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW',
    'NW', 'NNW'
  ];
  let bearing_display = arr[(val % 16)];
  return(
    <span title={bearing}>{bearing_display}</span>
  );
}

// Convert meters per second into miles per hour
export function formatSpeed(speed) {
  if (!speed || typeof speed === 'undefined') {
    return(<>N/A</>);
  }
  let display_speed = Math.round(speed * 2.2369) + ' mph';
  return(
    <span title={speed}>{display_speed}</span>
  );
}

// Determine if color is 'light'
export function isHexLight(color) {
  if (typeof color !== 'string' || !color) {
    color = '000000';
  }
  const hex = color.replace('#', '');
  const c_r = parseInt(hex.substr(0, 2), 16);
  const c_g = parseInt(hex.substr(2, 2), 16);
  const c_b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
  return brightness > 155;
}

// Format position data for markers
export function formatPositionData(data) {
  let positions = [];
  data.forEach(function (pos) {
    positions.push({
      id: pos.id,
      position: [pos.vehicle.position.latitude, pos.vehicle.position.longitude],
      speed: pos.vehicle.position.speed,
      bearing: pos.vehicle.position.bearing,
      metadata: pos.vehicle,
      timestamp: pos.vehicle.timestamp
    });
  });
  return positions;
}

// Format shape points for Polyline
export function formatShapePoints(points) {
  return (points.map((p, _i) => {
    return [p.lat, p.lon];
  }));
}

// Format start/stop trip time
export function formatTripTime(time) {
  const now = new Date();
  const [hour, minute, second] = time.split(':');
  now.setHours(hour);
  now.setMinutes(minute);
  now.setSeconds(second);
  return now.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
}

// Check if HH:MM:SS is after now
export function isTimeLaterThanNow(time) {
  const now = new Date();
  const t1 = new Date();
  const [hour, minute, second] = time.split(':');
  t1.setHours(hour);
  t1.setMinutes(minute);
  t1.setSeconds(second);
  return t1 > now;
}

// Check if a start and end time in HH:MM contains now
export function isTimeRangeIncludesNow(start_time, end_time) {
  const now = new Date();
  const t1 = new Date();
  const t2 = new Date();
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
  return (kilometers * 0.62137).toFixed(2) + ' mi';
}

// Format stop time update time
export function formatStopTimeUpdate(stopTimeUpdate) {
  if (typeof stopTimeUpdate.departure !== 'undefined' && typeof stopTimeUpdate.departure.time === 'number') {
    return new Date(stopTimeUpdate.departure.time * 1000).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
  }
  if (typeof stopTimeUpdate.arrival !== 'undefined' && typeof stopTimeUpdate.arrival.time === 'number') {
    return new Date(stopTimeUpdate.arrival.time * 1000).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
  }
  return '--';
}

// Render scheduled vs updated time
export function renderTimePoint(scheduleData, updateData) {
  // Determine which time point to use for trip update, or none.
  let updateTime = false;
  if (updateData && typeof updateData.departure !== 'undefined' && typeof updateData.departure.time === 'number') {
    updateTime = updateData.departure.time;
  } else if (updateData && typeof updateData.arrival !== 'undefined' && typeof updateData.arrival.time === 'number') {
    updateTime = updateData.arrival.time;
  }

  // Grab the relevant pieces for the scheduled time
  let scheduleTime = formatTripTime(scheduleData.departure_time);

  // Handle case where departure and arrival time are mismatched
  let scheduleDepartNote = '';
  if (scheduleData.arrival_time !== scheduleData.departure_time) {
    scheduleTime = formatTripTime(scheduleData.arrival_time);
    scheduleDepartNote = (<> (Departs {formatTripTime(scheduleData.departure_time)})</>);
  }

  // If no update provided (e.g. past or far-future trip), return scheduled
  if (!updateTime) {
    return(<>{scheduleTime}{scheduleDepartNote}</>);
  }

  updateTime = formatStopTimeUpdate(updateData);

  return(
    <>
      {scheduleTime !== updateTime && (
        <small><strike className="text-muted">{scheduleTime}{scheduleDepartNote}</strike><br /></small>
      )}
      <strong className="text-primary">{updateTime}</strong>
    </>
  );
}

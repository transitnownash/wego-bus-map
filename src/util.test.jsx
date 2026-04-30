import React from 'react';
import { afterEach, beforeAll, afterAll, expect, test, vi } from 'vitest';
import {
  renderBearing, formatDistanceTraveled, renderSpeed, renderUnixTimestamp, getJSON, formatShapePoints, isStopTimeUpdateLaterThanNow, formatStopTimeUpdate, isTimeRangeIncludesNow, isTimeLaterThanNow, getTripScheduleStatus, getStopScheduleStatus, getIsRealtimeDataAvailable, resetRealtimeStatusForTests, REALTIME_DATA_STATUS_CHANGE_EVENT,
} from './util';
import agenciesFixture from './fixtures/agencies.json';

const originalDate = Date.now;

beforeAll(() => {
  Date.now = () => Date.parse('Sun May 28 2023 12:00:00 GMT-0500 (Central Daylight Time)');
});

afterAll(() => {
  Date.now = originalDate;
});

afterEach(() => {
  vi.restoreAllMocks();
  resetRealtimeStatusForTests();
});

test('test getJSON', () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(agenciesFixture), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  );

  return getJSON('https://gtfs.transitnownash.org/agencies.json')
    .then((a) => {
      expect(a.data.length).toEqual(1);
      expect(a.data[0].agency_name).toEqual('WeGo Public Transit');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://gtfs.transitnownash.org/agencies.json',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });
});

test('test getJSON with params', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  );

  await getJSON('https://gtfs.transitnownash.org/routes.json', {
    params: {
      date: '2026-04-28',
      per_page: 200,
    },
  });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    'https://gtfs.transitnownash.org/routes.json?date=2026-04-28&per_page=200',
    expect.any(Object),
  );
});

test('getJSON returns empty array for realtime 503 responses', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('', {
      status: 503,
      statusText: 'Service Unavailable',
    }),
  );

  const data = await getJSON('https://gtfs.transitnownash.org/realtime/vehicle_positions.json');
  expect(data).toEqual([]);
  expect(getIsRealtimeDataAvailable()).toEqual(false);
});

test('getJSON marks realtime as available again after successful response', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response('', {
      status: 503,
      statusText: 'Service Unavailable',
    }),
  ).mockResolvedValueOnce(
    new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  );

  await getJSON('https://gtfs.transitnownash.org/realtime/trip_updates.json');
  expect(getIsRealtimeDataAvailable()).toEqual(false);

  await getJSON('https://gtfs.transitnownash.org/realtime/trip_updates.json');
  expect(getIsRealtimeDataAvailable()).toEqual(true);
});

test('getJSON throws for non-realtime 503 responses', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('', {
      status: 503,
      statusText: 'Service Unavailable',
    }),
  );

  await expect(getJSON('https://gtfs.transitnownash.org/routes.json')).rejects.toMatchObject({
    name: 'HttpError',
    code: 'HTTP_503',
  });
});

test('getJSON emits realtime status change events on outage and recovery', async () => {
  const handler = vi.fn();
  window.addEventListener(REALTIME_DATA_STATUS_CHANGE_EVENT, handler);

  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response('', {
      status: 503,
      statusText: 'Service Unavailable',
    }),
  ).mockResolvedValueOnce(
    new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  );

  await getJSON('https://gtfs.transitnownash.org/realtime/alerts.json');
  await getJSON('https://gtfs.transitnownash.org/realtime/alerts.json');

  expect(handler).toHaveBeenCalledTimes(2);
  expect(handler.mock.calls[0][0].detail.isRealtimeAvailable).toEqual(false);
  expect(handler.mock.calls[1][0].detail.isRealtimeAvailable).toEqual(true);

  window.removeEventListener(REALTIME_DATA_STATUS_CHANGE_EVENT, handler);
});

test('getJSON does not emit realtime status change event for non-realtime endpoint failure', async () => {
  const handler = vi.fn();
  window.addEventListener(REALTIME_DATA_STATUS_CHANGE_EVENT, handler);

  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('', {
      status: 503,
      statusText: 'Service Unavailable',
    }),
  );

  await expect(getJSON('https://gtfs.transitnownash.org/routes.json')).rejects.toMatchObject({
    name: 'HttpError',
    code: 'HTTP_503',
  });

  expect(handler).not.toHaveBeenCalled();
  window.removeEventListener(REALTIME_DATA_STATUS_CHANGE_EVENT, handler);
});

test('test renderUnixTimestamp', () => {
  expect(renderUnixTimestamp(1658680814)).toEqual(<span title={1658680814}>7/24/22, 11:40 AM</span>);
  expect(renderUnixTimestamp(1658680814, { hour: '2-digit', minute: '2-digit' })).toEqual(<span title={1658680814}>11:40 AM</span>);
});

test('test renderBearing', () => {
  expect(renderBearing(125)).toEqual(<span title={125}>SE</span>);
  expect(renderBearing(20)).toEqual(<span title={20}>NNE</span>);
  expect(renderBearing(undefined)).toEqual(<>N/A</>);
});

test('test renderSpeed', () => {
  expect(renderSpeed(10)).toEqual(<span title={10}>22 mph</span>);
  expect(renderSpeed(undefined)).toEqual(<>N/A</>);
});

test('formatShapePoints', () => {
  const points = [
    { lat: 10, lon: 11 },
    { lat: 12, lon: 13 },
  ];
  expect(formatShapePoints(points)).toEqual([
    [10, 11],
    [12, 13],
  ]);
});

test('isStopTimeUpdateLaterThanNow', () => {
  const stopTime = {
    departure_time: '11:55:00',
  };
  const stopUpdate = {
    departure: {
      time: 1685293700,
    },
  };
  expect(isStopTimeUpdateLaterThanNow(stopTime, stopUpdate)).toEqual(true);
  expect(isStopTimeUpdateLaterThanNow(stopTime, {})).toEqual(false);
});

test('isTimeLaterThanNow', () => {
  expect(isTimeLaterThanNow(' 9:05:00')).toEqual(false);
  expect(isTimeLaterThanNow('12:05:00')).toEqual(true);
});

test('isTimeRangeIncludesNow', () => {
  expect(isTimeRangeIncludesNow('11:05:00', '12:30:00')).toEqual(true);
  expect(isTimeRangeIncludesNow('12:05:00', '12:30:00')).toEqual(false);
});

test('test formatDistanceTraveled', () => {
  expect(formatDistanceTraveled(21.9)).toEqual('13.61 mi');
  expect(formatDistanceTraveled(undefined)).toEqual('Start');
});

test('test formatStopTimeUpdate', () => {
  const stopTimeUpdate = {
    departure: {
      time: 1685293700,
    },
  };
  expect(formatStopTimeUpdate(stopTimeUpdate)).toEqual('12:08 PM');
});

test('getTripScheduleStatus with trip-level canceled', () => {
  const tripUpdate = {
    trip_update: {
      trip: { schedule_relationship: 'Canceled' },
      stop_time_update: [{ stop_sequence: 1, schedule_relationship: 'Scheduled' }],
    },
  };
  expect(getTripScheduleStatus(tripUpdate, 1)).toEqual('canceled');
});

test('getTripScheduleStatus with trip-level unscheduled', () => {
  const tripUpdate = {
    trip_update: {
      trip: { schedule_relationship: 'Unscheduled' },
      stop_time_update: [{ stop_sequence: 1, schedule_relationship: 'Scheduled' }],
    },
  };
  expect(getTripScheduleStatus(tripUpdate, 1)).toEqual('unscheduled');
});

test('getTripScheduleStatus with all stops skipped', () => {
  const tripUpdate = {
    trip_update: {
      trip: { schedule_relationship: 'Scheduled' },
      stop_time_update: [
        { stop_sequence: 1, schedule_relationship: 'Skipped' },
        { stop_sequence: 2, schedule_relationship: 'Skipped' },
      ],
    },
  };
  expect(getTripScheduleStatus(tripUpdate, 2)).toEqual('skipped');
});

test('getTripScheduleStatus with all stops no-data', () => {
  const tripUpdate = {
    trip_update: {
      trip: { schedule_relationship: 'Scheduled' },
      stop_time_update: [
        { stop_sequence: 1, schedule_relationship: 'No Data' },
        { stop_sequence: 2, schedule_relationship: 'No Data' },
      ],
    },
  };
  expect(getTripScheduleStatus(tripUpdate, 2)).toEqual('no-data');
});

test('getTripScheduleStatus with mixed stop statuses returns null', () => {
  const tripUpdate = {
    trip_update: {
      trip: { schedule_relationship: 'Scheduled' },
      stop_time_update: [
        { stop_sequence: 1, schedule_relationship: 'Skipped' },
        { stop_sequence: 2, schedule_relationship: 'Scheduled' },
      ],
    },
  };
  expect(getTripScheduleStatus(tripUpdate, 2)).toEqual(null);
});

test('getStopScheduleStatus with skipped', () => {
  const stopTimeUpdate = { schedule_relationship: 'Skipped' };
  expect(getStopScheduleStatus(stopTimeUpdate)).toEqual('skipped');
});

test('getStopScheduleStatus with canceled', () => {
  const stopTimeUpdate = { schedule_relationship: 'Canceled' };
  expect(getStopScheduleStatus(stopTimeUpdate)).toEqual('canceled');
});

test('getStopScheduleStatus with unscheduled', () => {
  const stopTimeUpdate = { schedule_relationship: 'Unscheduled' };
  expect(getStopScheduleStatus(stopTimeUpdate)).toEqual('unscheduled');
});

test('getStopScheduleStatus with no-data', () => {
  const stopTimeUpdate = { schedule_relationship: 'No Data' };
  expect(getStopScheduleStatus(stopTimeUpdate)).toEqual('no-data');
});

test('getStopScheduleStatus with no status returns null', () => {
  const stopTimeUpdate = { schedule_relationship: 'Scheduled' };
  expect(getStopScheduleStatus(stopTimeUpdate)).toEqual(null);
});

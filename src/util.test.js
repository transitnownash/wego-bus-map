/* globals beforeAll, afterAll, test, expect */

import React from 'react';
import nock from 'nock';
import httpAdapter from 'axios/lib/adapters/http';
import {
  renderBearing, formatDistanceTraveled, renderSpeed, renderUnixTimestamp, getJSON, formatShapePoints, isStopTimeUpdateLaterThanNow, formatStopTimeUpdate, isTimeRangeIncludesNow, isTimeLaterThanNow,
} from './util';

const originalDate = Date.now;

beforeAll(() => {
  nock.disableNetConnect();
  Date.now = () => Date.parse('Sun May 28 2023 12:00:00 GMT-0500 (Central Daylight Time)');
});

afterAll(() => {
  nock.restore();
  Date.now = originalDate;
});

test('test getJSON', () => {
  nock('https://gtfs.transitnownash.org')
    .get('/agencies.json')
    .replyWithFile(200, `${__dirname}/fixtures/agencies.json`);

  return getJSON('https://gtfs.transitnownash.org/agencies.json', { adapter: httpAdapter })
    .then((a) => {
      expect(a.data.length).toEqual(1);
      expect(a.data[0].agency_name).toEqual('WeGo Public Transit');
      expect(nock.pendingMocks()).toEqual([]);
    });
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

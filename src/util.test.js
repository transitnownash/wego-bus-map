/* globals beforeAll, afterAll, test, expect */

import React from 'react';
import nock from 'nock';
import './util';
import { renderBearing, formatDistanceTraveled, renderSpeed, renderTimestamp, getJSON } from './util';
import httpAdapter from 'axios/lib/adapters/http';

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.restore();
});

test('test getJSON', () => {
  nock('https://gtfs.transitnownash.org')
    .get('/agencies.json')
    .replyWithFile(200,  __dirname + '/fixtures/agencies.json');

  return getJSON('https://gtfs.transitnownash.org/agencies.json', {adapter: httpAdapter})
    .then((a) => {
      expect(a.data.length).toEqual(1);
      expect(a.data[0].agency_name).toEqual('WeGo Public Transit');
      expect(nock.pendingMocks()).toEqual([]);
    });
});

test('test renderTimestamp', () => {
  expect(renderTimestamp(1658680814)).toEqual(<span title={1658680814}>7/24/22, 11:40 AM</span>);
  expect(renderTimestamp(1658680814, {hour: '2-digit', minute: '2-digit'})).toEqual(<span title={1658680814}>11:40 AM</span>);
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

// formatShapePoints(points)

// isStopTimeUpdateLaterThanNow(stopTime, stopUpdate)

// isTimeLaterThanNow(time)

// isTimeRangeIncludesNow(start_time, end_time)

// formatDistanceTraveled(kilometers)
test('test formatDistance', () => {
  expect(formatDistanceTraveled(21.9)).toEqual("13.61 mi");
  expect(formatDistanceTraveled(undefined)).toEqual("Start");
});

// formatStopTimeUpdate(stopTimeUpdate)

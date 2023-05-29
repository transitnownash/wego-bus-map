/* globals test, expect */

import React from 'react';
import { render } from '@testing-library/react';
import StopAccessibilityInformation from './StopAccessibilityInformation';

const stopFixture1 = require('../fixtures/stop-MCC5_10.json');
const stopFixture2 = require('../fixtures/stop-DOVDICWF.json');
const stopFixture3 = require('../fixtures/stop-10AHERNN.json');

test('renders StopAccessibilityInformation with wheelchair boarding (1)', () => {
  const { container } = render(
    <StopAccessibilityInformation stop={stopFixture1} />,
  );
  expect(container).toHaveTextContent('Some vehicles at this stop can be boarded by a rider in a wheelchair.');
  expect(container).toMatchSnapshot();
});

test('renders StopAccessibilityInformation declared unknown wheelchair boarding (0)', () => {
  const { container } = render(
    <StopAccessibilityInformation stop={stopFixture2} />,
  );
  expect(container).toMatchSnapshot();
  expect(container).toHaveTextContent('No accessibility information for the stop.');
});

test('renders StopAccessibilityInformation with wheelchair boarding unset (null)', () => {
  const { container } = render(
    <StopAccessibilityInformation stop={stopFixture3} />,
  );
  expect(container).toHaveTextContent('No accessibility information for the stop.');
  expect(container).toMatchSnapshot();
});

test('renders StopAccessibilityInformation with wheelchair boarding unavailable (2)', () => {
  const stopFixture4 = stopFixture1;
  stopFixture4.wheelchair_boarding = '2';
  const { container } = render(
    <StopAccessibilityInformation stop={stopFixture4} />,
  );
  expect(container).toHaveTextContent('Wheelchair boarding is not possible at this stop.');
  expect(container).toMatchSnapshot();
});

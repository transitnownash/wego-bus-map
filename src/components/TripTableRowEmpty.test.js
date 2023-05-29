/* globals test, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import TripTableRowEmpty from './TripTableRowEmpty';

test('renders TripTableRowEmpty', () => {
  const { container } = render(
    <table>
      <tbody>
        <TripTableRowEmpty />
      </tbody>
    </table>,
  );
  expect(screen.getByText('No scheduled trips.')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

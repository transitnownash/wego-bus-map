import React from 'react';
import LoadingScreen from './LoadingScreen';
import { renderWithRouter } from '../test-utils';

test('renders LoadingScreen', () => {
  renderWithRouter(<LoadingScreen />, { route: '/' });
});

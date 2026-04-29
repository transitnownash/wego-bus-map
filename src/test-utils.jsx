import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]} future={routerFuture}>
      {ui}
    </MemoryRouter>,
  );
}

export function renderWithRoute(ui, { route, path }) {
  return render(
    <MemoryRouter initialEntries={[route]} future={routerFuture}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}
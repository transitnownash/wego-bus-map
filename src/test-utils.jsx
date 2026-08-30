import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <CookiesProvider>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </CookiesProvider>,
  );
}

export function renderWithRoute(ui, { route, path }) {
  return render(
    <CookiesProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </CookiesProvider>,
  );
}
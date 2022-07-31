import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './controllers/Main';
import About from './controllers/About';
import TransitRoutes from './controllers/TransitRoutes';
import TransitRoute from './controllers/TransitRoute';
import Trip from './controllers/Trip';
import Stops from './controllers/Stops';
import Stop from './controllers/Stop';
import NoMatch from './controllers/NoMatch';
import ErrorBoundary from './components/ErrorBoundary';
import BCycle from './controllers/BCycle';
import './resources/bootstrap-with-mixins.scss';
import './App.scss';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route index={true} path="/" element={<Main />} />
          <Route path="/about" element={<About />} />
          <Route path="/routes" element={<TransitRoutes />} />
          <Route path="/routes/:route_id" element={<TransitRoute />} />
          <Route path="/trips/:trip_id" element={<Trip />} />
          <Route path="/stops" element={<Stops />} />
          <Route path="/stops/:stop_code" element={<Stop />} />
          <Route path="/bcycle" element={<BCycle />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

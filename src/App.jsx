import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import RealtimeDataStatusBanner from './components/RealtimeDataStatusBanner';
import './resources/bootstrap-with-mixins.scss';
import './App.scss';

const Main = lazy(() => import('./controllers/Main'));
const About = lazy(() => import('./controllers/About'));
const TransitRoutes = lazy(() => import('./controllers/TransitRoutes'));
const TransitRoute = lazy(() => import('./controllers/TransitRoute'));
const Trip = lazy(() => import('./controllers/Trip'));
const Stops = lazy(() => import('./controllers/Stops'));
const Stop = lazy(() => import('./controllers/Stop'));
const NoMatch = lazy(() => import('./controllers/NoMatch'));
const BCycle = lazy(() => import('./controllers/BCycle'));

function App() {
  React.useEffect(() => {
    // BEGIN Matomo Analytics
    var _mtm = window._mtm = window._mtm || [];
    _mtm.push({ 'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start' });
    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.async = true; g.src = 'https://analytics.yearg.in/js/container_mRvU3guK.js'; s.parentNode.insertBefore(g, s);
    // END Matomo Analytics
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RealtimeDataStatusBanner />
        <Suspense fallback={<LoadingScreen />}>
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
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

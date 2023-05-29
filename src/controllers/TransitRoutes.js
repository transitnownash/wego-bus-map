import React, { useEffect, useState } from 'react';
import TitleBar from '../components/TitleBar';
import LoadingScreen from '../components/LoadingScreen';
import { getJSON } from '../util';
import Footer from '../components/Footer';
import DataFetchError from '../components/DataFetchError';
import TransitRouteHeader from '../components/TransitRouteHeader';
import RouteLegend from '../components/RouteLegend';

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;
const REFRESH_ALERTS_TTL = 60 * 1000;

function TransitRoutes() {
  const [routes, setRouteData] = useState({});
  const [alerts, setAlerts] = useState({});
  const [isRoutesLoaded, setRoutesLoaded] = useState(false);
  const [isAlertLoaded, setAlertLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);

  // Consolidated check that things are ready to go
  const isUIReady = [isRoutesLoaded, isAlertLoaded].every((a) => a === true);

  useEffect(() => {
    getJSON(`${GTFS_BASE_URL}/routes.json`)
      .then((r) => setRouteData(r.data))
      .then(() => setRoutesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
      .then((data) => setAlerts(data))
      .then(() => setAlertLoaded(true))
      .catch((error) => setDataFetchError(error));

    const refreshAlertsInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
        .then((data) => setAlerts(data));
    }, REFRESH_ALERTS_TTL);

    return () => {
      clearInterval(refreshAlertsInterval);
    };
  }, [isUIReady]);

  if (!isUIReady) {
    return (<LoadingScreen />);
  }

  if (dataFetchError) {
    return (<DataFetchError error={dataFetchError} />);
  }

  const sortedRoutes = routes.sort((a, b) => parseInt(a.route_short_name, 10) - parseInt(b.route_short_name, 10));

  return (
    <div>
      <TitleBar></TitleBar>
      <div className="container transit-routes">
        <RouteLegend />
        {sortedRoutes.map((item, _index) => {
          const routeAlerts = alerts.filter((a) => typeof a.alert.informed_entity !== 'undefined' && a.alert.informed_entity[0].route_id === item.route_short_name);
          return (<TransitRouteHeader key={item.id} route={item} alerts={routeAlerts} showRouteType={true}></TransitRouteHeader>);
        })}
      </div>
      <Footer></Footer>
    </div>
  );
}

export default TransitRoutes;

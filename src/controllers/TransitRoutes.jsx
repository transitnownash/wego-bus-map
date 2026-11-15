import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TitleBar from '../components/TitleBar';
import LoadingScreen from '../components/LoadingScreen';
import { getJSON } from '../util';
import Footer from '../components/Footer';
import DataFetchError from '../components/DataFetchError';
import TransitRouteHeader from '../components/TransitRouteHeader';
import RouteLegend from '../components/RouteLegend';
import TransitMap from '../components/TransitMap';
import usePolling from '../hooks/usePolling';

const GTFS_BASE_URL = import.meta.env.VITE_GTFS_BASE_URL;
const REFRESH_ALERTS_TTL = 60 * 1000;

function TransitRoutes() {
  const [routes, setRouteData] = useState({});
  const [alerts, setAlerts] = useState({});
  const [routeShapes, setRouteShapes] = useState([]);
  const [isRoutesLoaded, setRoutesLoaded] = useState(false);
  const [isRouteShapesLoaded, setRouteShapesLoaded] = useState(false);
  const [isAlertLoaded, setAlertLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);
  const map = useRef(null);
  const navigate = useNavigate();

  // Consolidated check that things are ready to go
  const isUIReady = [isRoutesLoaded, isRouteShapesLoaded, isAlertLoaded].every((a) => a === true);

  useEffect(() => {
    getJSON(`${GTFS_BASE_URL}/routes.json`)
      .then((r) => {
        setRouteData(r.data);
        setRoutesLoaded(true);
        return Promise.all(r.data.map((route) => getJSON(`${GTFS_BASE_URL}/routes/${route.route_gid}/shapes.json`, { params: { per_page: 200 } })
          .then((rs) => rs.data.map((shape) => ({
            ...shape,
            route_color: route.route_color,
            tooltip: `${route.route_short_name} - ${route.route_long_name}`,
            shapeEventHandlers: { click: () => navigate(`/routes/${route.route_gid}`) },
          })))));
      })
      .then((shapesByRoute) => setRouteShapes(shapesByRoute.flat()))
      .then(() => setRouteShapesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
      .then((data) => setAlerts(data))
      .then(() => setAlertLoaded(true))
      .catch((error) => setDataFetchError(error));
  }, [navigate]);

  usePolling(() => getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
    .then((data) => setAlerts(data)), REFRESH_ALERTS_TTL, isUIReady);

  if (!isUIReady) {
    return (<LoadingScreen />);
  }

  if (dataFetchError) {
    return (<DataFetchError error={dataFetchError} />);
  }

  const sortedRoutes = [...routes].sort((a, b) => parseInt(a.route_short_name, 10) - parseInt(b.route_short_name, 10));

  return (
    <div>
      <TitleBar></TitleBar>
      <div className="container transit-routes">
        {routeShapes.length > 0 && (
          <TransitMap routes={routes} routeShapes={routeShapes} map={map} zoom={11} shapeWeight={4}></TransitMap>
        )}
        <RouteLegend />
        {sortedRoutes.map((item, _index) => {
          const routeAlerts = alerts.filter((a) => Array.isArray(a.alert?.informed_entity)
            && a.alert.informed_entity.some((ent) => ent.route_id === item.route_short_name));
          return (<TransitRouteHeader key={item.id} route={item} alerts={routeAlerts} showRouteType={true}></TransitRouteHeader>);
        })}
      </div>
      <Footer></Footer>
    </div>
  );
}

export default TransitRoutes;

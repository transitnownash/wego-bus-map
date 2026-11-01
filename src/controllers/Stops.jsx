import React, { useEffect, useMemo, useRef, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { getJSON } from '../util';
import DataFetchError from '../components/DataFetchError';
import LocateButton from '../components/LocateButton';
import MapLinks from '../components/MapLinks';
import TransitMap from '../components/TransitMap';
import AlertButton from '../components/AlertButton';
import AlertModal from '../components/AlertModal';
import usePolling from '../hooks/usePolling';

const GTFS_BASE_URL = import.meta.env.VITE_GTFS_BASE_URL;
const REFRESH_ALERTS_TTL = 60 * 1000;

// Leave shapes on map when clicked
const KEEP_SHAPES_ON_CLICK = {
  click: (_e) => {
    // noop
  },
};

function Stops() {
  const [alerts, setAlerts] = useState([]);
  const [routes, setRouteData] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeShapes, setRouteShapes] = useState([]);
  const [isRoutesLoaded, setRoutesLoaded] = useState(false);
  const [isStopsLoaded, setStopsLoaded] = useState(false);
  const [isRouteShapesLoaded, setRouteShapesLoaded] = useState(false);
  const [isAlertsLoaded, setAlertsLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);
  const [alertModalShow, setAlertModalShow] = useState(false);
  const map = useRef(null);

  // Consolidated check that things are ready to go
  const isUIReady = [isRoutesLoaded, isStopsLoaded, isRouteShapesLoaded, isAlertsLoaded].every((a) => a === true);

  useEffect(() => {
    getJSON(`${GTFS_BASE_URL}/routes.json`)
      .then((r) => setRouteData(r.data))
      .then(() => setRoutesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/stops.json`, { params: { per_page: 2000 } })
      .then((s) => setStops(s.data))
      .then(() => setStopsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/shapes.json`, { params: { per_page: 2000 } })
      .then((s) => setRouteShapes(s.data))
      .then(() => setRouteShapesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
      .then((data) => setAlerts(data))
      .then(() => setAlertsLoaded(true))
      .catch((error) => setDataFetchError(error));
  }, []);

  usePolling(() => getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
    .then((data) => setAlerts(data))
    .catch((error) => setDataFetchError(error)), REFRESH_ALERTS_TTL, isUIReady);

  const routeStops = useMemo(() => stops.map((item) => ({ id: item.id, stop: item })), [stops]);
  const coloredRouteShapes = useMemo(() => routeShapes.map((s) => ({
    ...s,
    route_color: '753cbe', // default purple
    shapeEventHandlers: KEEP_SHAPES_ON_CLICK,
  })), [routeShapes]);

  if (dataFetchError) {
    return (<DataFetchError error={dataFetchError}></DataFetchError>);
  }

  if (!isUIReady) {
    return (<LoadingScreen hideTitleBar={true}></LoadingScreen>);
  }

  // Remove invalid alerts (no informed entity)
  const allAlerts = alerts.filter((a) => typeof a.alert.informed_entity !== 'undefined');

  const mapControls = {
    topRight: (
      <div className="map-top-right-container">
        <MapLinks />
      </div>
    ),
    bottomLeft: (
      <div className="d-flex map-bottom-left-container">
        <AlertButton alerts={allAlerts} buttonAction={() => setAlertModalShow(true)}></AlertButton>
        <LocateButton buttonAction={() => locateUserOnMap(map)}></LocateButton>
      </div>
    ),
  };

  const locateUserOnMap = function (map) {
    if (typeof map.current !== 'undefined' && map.current) {
      map.current.locate();
    }
  };

  return (
    <div className="stops">
      <TransitMap map={map} routeStops={routeStops} routeShapes={coloredRouteShapes} alerts={allAlerts} mapControls={mapControls}></TransitMap>
      <AlertModal alerts={allAlerts} show={alertModalShow} onHide={() => setAlertModalShow(false)} routes={routes}></AlertModal>
    </div>
  );
}

export default Stops;

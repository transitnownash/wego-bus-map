import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import dayjs from 'dayjs';
import NoMatch from './NoMatch';
import TitleBar from '../components/TitleBar';
import LoadingScreen from '../components/LoadingScreen';
import TransitMap from '../components/TransitMap';
import TripTable from '../components/TripTable';
import Footer from '../components/Footer';
import { getJSON, formatShapePoints } from '../util';
import AlertList from '../components/AlertList';
import DataFetchError from '../components/DataFetchError';
import TransitRouteHeader from '../components/TransitRouteHeader';
import usePolling from '../hooks/usePolling';

const GTFS_BASE_URL = import.meta.env.VITE_GTFS_BASE_URL;
const REFRESH_VEHICLE_POSITIONS_TTL = 10 * 1000;
const REFRESH_ALERTS_TTL = 120 * 1000;
const REFRESH_TRIP_UPDATES_TTL = 120 * 1000;

// Leave shapes on map when clicked
const KEEP_SHAPES_ON_CLICK = {
  click: (_e) => {
    // noop
  },
};

function TransitRoute() {
  const [route, setRoute] = useState({});
  const [routeTrips, setRouteTrips] = useState([]);
  const [routeStops, setRouteStops] = useState([]);
  const [routeShapes, setRouteShapes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tripUpdates, setTripUpdates] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [vehicleMarkers, setVehicleMarkers] = useState([]);
  const [isRouteLoaded, setRouteLoaded] = useState(false);
  const [isRouteStopsLoaded, setRouteStopsLoaded] = useState(false);
  const [isRouteShapesLoaded, setRouteShapesLoaded] = useState(false);
  const [isRouteTripsLoaded, setRouteTripsLoaded] = useState(false);
  const [isAlertLoaded, setAlertLoaded] = useState(false);
  const [isTripUpdateLoaded, setTripUpdateLoaded] = useState(false);
  const [isAgencyLoaded, setAgencyLoaded] = useState(false);
  const [isVehiclePositionLoaded, setVehiclePositionLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);
  const [cookies, setCookie] = useCookies(['gtfs-schedule-date']);
  const [scheduleDate, setScheduleDate] = useState(cookies['gtfs-schedule-date'] || dayjs().format('YYYY-MM-DD'));
  const [isLoadingTripDate, setIsLoadingTripDate] = useState(false);
  const [isMapCentered, setIsMapCentered] = useState(false);
  const params = useParams();
  const map = useRef(null);

  // Consolidated check that things are ready to go
  const isUIReady = [
    isRouteLoaded, isRouteTripsLoaded, isRouteStopsLoaded, isRouteShapesLoaded,
    isAlertLoaded, isTripUpdateLoaded, isAgencyLoaded, isVehiclePositionLoaded,
  ].every((a) => a === true);

  useEffect(() => {
    getJSON(`${GTFS_BASE_URL}/routes/${params.route_id}.json`)
      .then((r) => setRoute(r))
      .then(() => setRouteLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/routes/${params.route_id}/stops.json`, { params: { date: scheduleDate, per_page: 200 } })
      .then((rs) => setRouteStops(rs.data))
      .then(() => setRouteStopsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/routes/${params.route_id}/shapes.json`, { params: { date: scheduleDate, per_page: 200 } })
      .then((rs) => setRouteShapes(rs.data))
      .then(() => setRouteShapesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/routes/${params.route_id}/trips.json`, { params: { date: scheduleDate, per_page: 500 } })
      .then((r) => setRouteTrips(r.data))
      .then(() => setRouteTripsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/agencies.json`)
      .then((a) => setAgencies(a.data))
      .then(() => setAgencyLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
      .then((data) => setAlerts(data))
      .then(() => setAlertLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/trip_updates.json`)
      .then((data) => setTripUpdates(data))
      .then(() => setTripUpdateLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/vehicle_positions.json`)
      .then((data) => setVehicleMarkers(data))
      .then(() => setVehiclePositionLoaded(true))
      .catch((error) => setDataFetchError(error));
  }, [params.route_id]);

  usePolling(() => getJSON(`${GTFS_BASE_URL}/realtime/vehicle_positions.json`)
    .then((data) => setVehicleMarkers(data)), REFRESH_VEHICLE_POSITIONS_TTL, isUIReady);

  usePolling(() => getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
    .then((data) => setAlerts(data)), REFRESH_ALERTS_TTL, isUIReady);

  usePolling(() => getJSON(`${GTFS_BASE_URL}/realtime/trip_updates.json`)
    .then((data) => setTripUpdates(data)), REFRESH_TRIP_UPDATES_TTL, isUIReady);

  // Add route color to shapes
  const coloredRouteShapes = useMemo(() => routeShapes.map((s) => ({
    ...s,
    route_color: route.route_color,
    shapeEventHandlers: KEEP_SHAPES_ON_CLICK,
  })), [routeShapes, route.route_color]);

  // Bounds of every point on the route, for centering the map
  const routeBounds = useMemo(() => {
    const allPoints = routeShapes.flatMap((item) => item.points);
    return allPoints.length > 0 ? L.latLngBounds(formatShapePoints(allPoints)) : null;
  }, [routeShapes]);

  useEffect(() => {
    if (map.current && routeBounds && !isMapCentered) {
      map.current.fitBounds(routeBounds, { padding: [25, 25] });
      setIsMapCentered(true);
    }
  }, [routeBounds, isMapCentered]);

  if (dataFetchError) {
    return (<DataFetchError error={dataFetchError}></DataFetchError>);
  }

  if (!isUIReady) {
    return (<LoadingScreen></LoadingScreen>);
  }

  // No matching route
  if (!route || route.status === 404) {
    return (<NoMatch></NoMatch>);
  }

  // Filter vehicle positions to only those relevant to this route
  const filteredVehiclePositions = vehicleMarkers
    .filter((v) => v.vehicle.trip)
    .filter((v) => v.vehicle.trip.route_id === route.route_gid || v.vehicle.trip.route_id === route.route_short_name);

  const routeAlerts = alerts.filter((a) => Array.isArray(a.alert?.informed_entity)
    && a.alert.informed_entity
      .filter((ie) => typeof ie.route_id !== 'undefined')
      .some((ie) => String(ie.route_id) === String(route.route_gid) || String(ie.route_id) === String(route.route_short_name)));

  // Load in selected date
  const handleDateFieldChange = (event) => {
    if (!event.target.value) {
      return;
    }
    setIsLoadingTripDate(true);
    setCookie('gtfs-schedule-date', event.target.value, {
      path: '/', maxAge: 90, sameSite: 'none', secure: true,
    });
    setScheduleDate(event.target.value);
    getJSON(`${GTFS_BASE_URL}/routes/${route.route_gid}/trips.json`, { params: { date: event.target.value, per_page: 500 } })
      .then((rt) => setRouteTrips(rt.data))
      .then(() => setIsLoadingTripDate(false));
  };

  // Missing data (no service on date)
  if (routeTrips.length === 0 || routeShapes.length === 0) {
    return (
      <div>
        <TitleBar />
        <div className="container transit-route">
          <TransitRouteHeader route={route} alerts={routeAlerts} showRouteType={true} />
          <AlertList alerts={routeAlerts} routes={[route]}></AlertList>
          <TripTable route={route} routeTrips={routeTrips} tripUpdates={tripUpdates} scheduleDate={scheduleDate} handleDateFieldChange={handleDateFieldChange} isLoadingTripDate={isLoadingTripDate}></TripTable>
        </div>
        <Footer />
      </div>
    );
  }

  // Nest stops for map compatibility
  const mapStops = [];
  routeStops.map((s) => mapStops.push({ id: s.id, stop: s }));

  const center = routeBounds.getCenter();

  return (
    <div>
      <TitleBar />
      <div className="container transit-route">
        <TransitRouteHeader route={route} alerts={routeAlerts} showRouteType={true} />
        <TransitMap vehicleMarkers={filteredVehiclePositions} routes={[route]} agencies={agencies} routeShapes={coloredRouteShapes} routeStops={mapStops} alerts={routeAlerts} tripUpdates={tripUpdates} map={map} center={[center.lat, center.lng]}></TransitMap>
        <AlertList alerts={routeAlerts} routes={[route]} showHorizontal></AlertList>
        <TripTable route={route} routeTrips={routeTrips} tripUpdates={tripUpdates} scheduleDate={scheduleDate} handleDateFieldChange={handleDateFieldChange} isLoadingTripDate={isLoadingTripDate}></TripTable>
      </div>
      <Footer />
    </div>
  );
}

export default TransitRoute;

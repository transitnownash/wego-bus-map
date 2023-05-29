import React, { useEffect, useRef, useState } from 'react';
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

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;
const REFRESH_VEHICLE_POSITIONS_TTL = 10 * 1000;
const REFRESH_ALERTS_TTL = 120 * 1000;
const REFRESH_TRIP_UPDATES_TTL = 120 * 1000;

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

    // Refresh position data at set interval
    const refreshPositionsInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(`${GTFS_BASE_URL}/realtime/vehicle_positions.json`)
        .then((data) => setVehicleMarkers(data));
    }, REFRESH_VEHICLE_POSITIONS_TTL);

    // Refresh alerts data at set interval
    const refreshAlertsInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
        .then((data) => setAlerts(data));
    }, REFRESH_ALERTS_TTL);

    const refreshTripUpdatesInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(`${GTFS_BASE_URL}/realtime/trip_updates.json`)
        .then((data) => setTripUpdates(data));
    }, REFRESH_TRIP_UPDATES_TTL);

    // Run on unmount
    return () => {
      clearInterval(refreshPositionsInterval);
      clearInterval(refreshAlertsInterval);
      clearInterval(refreshTripUpdatesInterval);
    };
  }, [params.route_id, isUIReady]);

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
  const filteredVehiclePositions = vehicleMarkers.filter((v) => v.vehicle.trip.route_id === route.route_gid || v.vehicle.trip.route_id === route.route_short_name);
  const routeAlerts = alerts.filter((a) => typeof a.alert.informed_entity !== 'undefined' && (a.alert.informed_entity[0].route_id === route.route_gid || a.alert.informed_entity[0].route_id === route.route_short_name));

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

  // Add route color to shapes
  routeShapes.map((s) => s.route_color = route.route_color);

  // Set the map to center on the trip route
  const allPoints = [];
  routeShapes.map((item) => {
    item.points.map((point) => allPoints.push(point));
  });
  const getPolyLineBounds = L.latLngBounds(formatShapePoints(allPoints));
  const center = getPolyLineBounds.getCenter();
  if (map.current) {
    map.current.fitBounds(getPolyLineBounds, { padding: [25, 25] });
  }

  return (
    <div>
      <TitleBar />
      <div className="container transit-route">
        <TransitRouteHeader route={route} alerts={routeAlerts} showRouteType={true} />
        <TransitMap vehicleMarkers={filteredVehiclePositions} routes={[route]} agencies={agencies} routeShapes={routeShapes} routeStops={mapStops} alerts={routeAlerts} tripUpdates={tripUpdates} map={map} center={[center.lat, center.lng]}></TransitMap>
        <AlertList alerts={routeAlerts} routes={[route]}></AlertList>
        <TripTable route={route} routeTrips={routeTrips} tripUpdates={tripUpdates} scheduleDate={scheduleDate} handleDateFieldChange={handleDateFieldChange} isLoadingTripDate={isLoadingTripDate}></TripTable>
      </div>
      <Footer />
    </div>
  );
}

export default TransitRoute;

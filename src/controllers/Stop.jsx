import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faArrowRight, faDirections, faLandmark, faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { useCookies } from 'react-cookie';
import dayjs from 'dayjs';
import TransitRouteHeader from '../components/TransitRouteHeader';
import TransitMap from '../components/TransitMap';
import TitleBar from '../components/TitleBar';
import TimePoint from '../components/TimePoint';
import StopAccessibilityInformation from '../components/StopAccessibilityInformation';
import LoadingScreen from '../components/LoadingScreen';
import HidePastTripsToggle from '../components/HidePastTripsToggle';
import Footer from '../components/Footer';
import DataFetchError from '../components/DataFetchError';
import AlertList from '../components/AlertList';
import { getJSON, isStopTimeUpdateLaterThanNow, isTimeLaterThanNow } from '../util';
import TimePointLegend from '../components/TimePointLegend';
import StopCode from '../components/StopCode';
import DateSelector from '../components/DateSelector';
import Headsign from '../components/Headsign';
import NextDeparturesTable from '../components/NextDeparturesTable';
import usePolling from '../hooks/usePolling';

const GTFS_BASE_URL = import.meta.env.VITE_GTFS_BASE_URL;
const REFRESH_VEHICLE_POSITIONS_TTL = 7000;
const REFRESH_ALERTS_TTL = 60 * 1000;
const REFRESH_TRIP_UPDATES_TTL = 60 * 1000;
const TRIPS_PER_PAGE = 2000;

function stopTimeAtStop(trip) {
  return trip.stop_times[0].arrival_time ? trip.stop_times[0].arrival_time : trip.stop_times[0].departure_time;
}

function compareStrings(a, b) {
  if (a === b) {
    return 0;
  }
  return a > b ? 1 : -1;
}

// Alerts keyed by the route of their first informed entity
function groupAlertsByFirstRoute(alerts) {
  const byRoute = new Map();
  alerts.forEach((a) => {
    const routeId = a.alert.informed_entity && a.alert.informed_entity[0].route_id;
    if (!byRoute.has(routeId)) {
      byRoute.set(routeId, []);
    }
    byRoute.get(routeId).push(a);
  });
  return byRoute;
}

function Stops() {
  const [stop, setStop] = useState([]);
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [vehiclePositions, setVehiclePositions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tripUpdates, setTripUpdates] = useState([]);
  const [isStopLoaded, setStopLoaded] = useState(false);
  const [isTripsLoaded, setTripsLoaded] = useState(false);
  const [isAgenciesLoaded, setAgenciesLoaded] = useState(false);
  const [isRoutesLoaded, setRoutesLoaded] = useState(false);
  const [isVehiclePositionLoaded, setVehiclePositionLoaded] = useState(false);
  const [isAlertsLoaded, setAlertsLoaded] = useState(false);
  const [isTripUpdatesLoaded, setTripUpdatesLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);
  const [hidePastTrips, setHidePastTrips] = useState(true);
  const [cookies, setCookie] = useCookies(['gtfs-schedule-date']);
  const [scheduleDate, setScheduleDate] = useState(cookies['gtfs-schedule-date'] || dayjs().format('YYYY-MM-DD'));
  const [isLoadingTripDate, setIsLoadingTripDate] = useState(false);
  const map = useRef(null);
  const params = useParams();

  // Consolidated check that things are ready to go
  const isUIReady = [
    isStopLoaded, isTripsLoaded, isRoutesLoaded, isAgenciesLoaded,
    isVehiclePositionLoaded, isAlertsLoaded, isTripUpdatesLoaded,
  ].every((a) => a === true);

  const handleCheckboxChange = function (e) {
    setHidePastTrips(e.target.checked === true);
  };

  useEffect(() => {
    getJSON(`${GTFS_BASE_URL}/stops/${params.stop_code}.json`)
      .then((s) => setStop(s))
      .then(() => setStopLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/stops/${params.stop_code}/trips.json`, { params: { date: scheduleDate, per_page: TRIPS_PER_PAGE } })
      .then((t) => setTrips(t.data))
      .then(() => setTripsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/stops/${params.stop_code}/routes.json`)
      .then((r) => setRoutes(r.data))
      .then(() => setRoutesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/agencies.json`)
      .then((a) => setAgencies(a.data))
      .then(() => setAgenciesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/vehicle_positions.json`)
      .then((data) => setVehiclePositions(data))
      .then(() => setVehiclePositionLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
      .then((data) => setAlerts(data))
      .then(() => setAlertsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/trip_updates.json`)
      .then((data) => setTripUpdates(data))
      .then(() => setTripUpdatesLoaded(true))
      .catch((error) => setDataFetchError(error));
  }, [params.stop_code]);

  usePolling(() => getJSON(`${GTFS_BASE_URL}/realtime/vehicle_positions.json`)
    .then((data) => setVehiclePositions(data)), REFRESH_VEHICLE_POSITIONS_TTL, isUIReady);

  usePolling(() => getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
    .then((data) => setAlerts(data)), REFRESH_ALERTS_TTL, isUIReady);

  usePolling(() => getJSON(`${GTFS_BASE_URL}/realtime/trip_updates.json`)
    .then((data) => setTripUpdates(data)), REFRESH_TRIP_UPDATES_TTL, isUIReady);

  // Sort trips by time at stop
  const sortedTrips = useMemo(() => [...trips].sort((a, b) => {
    const aTime = stopTimeAtStop(a);
    const bTime = stopTimeAtStop(b);
    if (aTime === bTime) {
      return parseInt(a.route_gid, 10) - parseInt(b.route_gid, 10);
    }
    return compareStrings(aTime, bTime);
  }), [trips]);

  const sortedRoutes = useMemo(
    () => [...routes].sort((a, b) => parseInt(a.route_short_name, 10) - parseInt(b.route_short_name, 10)),
    [routes],
  );

  const sortedChildStops = useMemo(
    () => [...(stop.child_stops || [])].sort((a, b) => compareStrings(a.stop_code, b.stop_code)),
    [stop.child_stops],
  );

  const routesById = useMemo(() => new Map(routes.map((r) => [r.route_gid, r])), [routes]);
  const alertsByRoute = useMemo(() => groupAlertsByFirstRoute(alerts), [alerts]);

  // Trip updates that touch this stop, keyed by trip
  const stopTripUpdatesByTrip = useMemo(() => {
    const byTrip = new Map();
    tripUpdates.forEach((tu) => {
      if (tu.trip_update.stop_time_update?.some((u) => u.stop_id === stop.stop_gid)) {
        const tripId = tu.trip_update.trip?.trip_id;
        if (!byTrip.has(tripId)) {
          byTrip.set(tripId, tu);
        }
      }
    });
    return byTrip;
  }, [tripUpdates, stop.stop_gid]);

  if (dataFetchError) {
    return (<DataFetchError error={dataFetchError}></DataFetchError>);
  }

  if (!isUIReady) {
    return (<LoadingScreen></LoadingScreen>);
  }

  // Filter vehicle positions to relevant trips
  const tripsAtStop = new Set(trips.map((t) => t.trip_gid));
  const filteredVehiclePositions = vehiclePositions.filter((v) => v.vehicle.trip && tripsAtStop.has(v.vehicle.trip.trip_id));

  // Filter alerts to single stop
  const stopAlerts = [];
  alerts.forEach((a) => {
    if (typeof a.alert.informed_entity === 'undefined') {
      return;
    }
    a.alert.informed_entity.forEach((e) => {
      if (e.stop_id === stop.stop_gid) {
        stopAlerts.push(a);
      }
    });
  });

  // Assign current stop to be rendered, plus any child stops of a parent station
  const stops = [stop, ...sortedChildStops];

  // Nest stops inside an object with unique IDs for React keys
  const routeStops = stops.map((item) => {
    // Always prefix child stops, and include trip_gid if present
    const isChild = stop.child_stops && stop.child_stops.some((child) => child.id === item.id);
    const tripGid = item.trip_gid ? `-${item.trip_gid}` : '';
    return { id: isChild ? `child-${item.id}${tripGid}` : `${item.id}${tripGid}`, stop: item, trip_gid: item.trip_gid };
  });

  // Load in selected date
  const handleDateFieldChange = (event) => {
    if (!event.target.value) {
      return <></>;
    }
    setIsLoadingTripDate(true);
    setCookie('gtfs-schedule-date', event.target.value, {
      path: '/', maxAge: 90, sameSite: 'none', secure: true,
    });
    setScheduleDate(event.target.value);
    getJSON(`${GTFS_BASE_URL}/stops/${params.stop_code}/trips.json`, { params: { date: event.target.value, per_page: TRIPS_PER_PAGE } })
      .then((st) => setTrips(st.data))
      .then(() => setIsLoadingTripDate(false));
  };

  return (
    <div>
      <TitleBar></TitleBar>
      <div className="container">
        <div className="stop-name">{stop.stop_name}</div>
        {stopAlerts.length > 0
          && (<div className="p-2 mb-2 text-center bg-warning text-bg-warning rounded-bottom" style={{ marginTop: '-1em' }}><FontAwesomeIcon icon={faWarning} fixedWidth={true}></FontAwesomeIcon> System Alert at Stop</div>)
        }
        <div className="text-center p-2 mb-2">
          <div><StopCode stop={stop}/> {stop.stop_desc}</div>
          {stop.parent_station_gid && (
            <div className="p-2 mb-2"><FontAwesomeIcon icon={faLandmark} fixedWidth={true}></FontAwesomeIcon> <strong>Inside <Link to={`/stops/${stop.parent_station_gid}`}>{stop.parent_station.stop_name}</Link></strong></div>
          )}
        </div>
        <div className="text-center p-2 mb-2">
          <StopAccessibilityInformation stop={stop}></StopAccessibilityInformation>
        </div>
        <div className="text-center my-2"><a href={`https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=${stop.stop_lat}%2C${stop.stop_lon}`} className="btn btn-secondary btn-sm" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faDirections} fixedWidth={true} /> Directions</a></div>
        <NextDeparturesTable stopCode={params.stop_code} stopGid={stop.stop_gid} tripUpdates={tripUpdates} vehiclePositions={vehiclePositions}></NextDeparturesTable>
        {stop.child_stops.length > 0 && (
          <div className="card mb-3 small">
            <div className="card-header"><strong>Station Stops</strong></div>
            <div className="card-body">
              <table className="table table-sm small">
                <thead>
                  <tr>
                    <th>Stop Code</th>
                    <th>Stop Name</th>
                    <th>Stop Description</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChildStops.map((item) => (
                      <tr key={`child-${item.id}`}>
                        <td><Link to={`/stops/${item.stop_code}`}><span className='stop-code badge bg-white text-black border border-secondary'>{item.stop_code}</span></Link></td>
                        <td><Link to={`/stops/${item.stop_code}`}>{item.stop_name}</Link></td>
                        <td>{item.stop_desc}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {routes.length > 0 && (
          <>
            <div className="row mb-2">
              {sortedRoutes.map((item) => {
                const routeAlerts = alertsByRoute.get(item.route_gid) || [];
                return (
                  <div key={item.id} className="col-md-4">
                    <TransitRouteHeader route={item} alerts={routeAlerts} showRouteType={true}></TransitRouteHeader>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <TransitMap center={[stop.stop_lat, stop.stop_lon]} zoom={19} map={map} vehicleMarkers={filteredVehiclePositions} routes={routes} agencies={agencies} routeStops={routeStops} alerts={stopAlerts}></TransitMap>
        <AlertList alerts={stopAlerts} routes={routes} showHorizontal></AlertList>
        {trips.length > 0 && (
          <>
            <div className="d-flex align-items-center mb-2">
              <div className="flex-grow-1">
                <HidePastTripsToggle hidePastTrips={hidePastTrips} onChange={handleCheckboxChange} />
              </div>
              <div>
                {typeof handleDateFieldChange === 'function' && (
                  <DateSelector scheduleDate={scheduleDate} handleDateFieldChange={handleDateFieldChange} isLoading={isLoadingTripDate} />
                )}
              </div>
            </div>
            <div className="table-responsive-md">
              <table className="table table-sm small">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Trip</th>
                    <th>Headsign</th>
                    <th className="bg-dark text-light text-center">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTrips.map((item, _index) => {
                    const key = `${item.route_gid}-${item.trip_gid}`;
                    const route = routesById.get(item.route_gid);
                    const routeAlerts = alertsByRoute.get(item.route_gid) || [];
                    // Find stop time update relevant to this trip and this stop
                    let stopTimeUpdate = {};
                    const stopTimeTripUpdate = stopTripUpdatesByTrip.get(item.trip_gid);
                    if (stopTimeTripUpdate) {
                      stopTimeTripUpdate.trip_update.stop_time_update.forEach((stu) => {
                        if (stu.stop_id === stop.stop_gid) {
                          stopTimeUpdate = stu;
                        }
                      });
                    }

                    let cellClasses = '';
                    const isUpdateInFuture = isStopTimeUpdateLaterThanNow(item.stop_times[0], stopTimeUpdate);
                    const isScheduledInFuture = item.stop_times[0].departure_time
                      ? isTimeLaterThanNow(item.stop_times[0].departure_time)
                      : isTimeLaterThanNow(item.stop_times[0].arrival_time);
                    const isStoppedSkipped = stopTimeUpdate?.schedule_relationship === 'Skipped';

                    // Always show if skipped, or if scheduled time is in future, or if not hiding past trips
                    if (!isUpdateInFuture && !isScheduledInFuture && !isStoppedSkipped && hidePastTrips) {
                      return null;
                    }
                    if (!isUpdateInFuture && !isScheduledInFuture) {
                      cellClasses = 'ps-1 border-start border-gray border-5';
                    }
                    return (
                      <tr key={key}>
                        <td style={{ maxWidth: '200px' }}>
                          <div className={cellClasses}>
                            <TransitRouteHeader route={route} alerts={routeAlerts}></TransitRouteHeader>
                          </div>
                        </td>
                        <td className="align-middle"><Link to={`/trips/${item.trip_gid}`}>{item.trip_gid}</Link></td>
                        <td className="align-middle">
                          <strong><Headsign headsign={item.trip_headsign} /></strong><br />
                          {item.direction_id === '1'
                            ? (<><FontAwesomeIcon icon={faArrowLeft} /> Inbound</>)
                            : (<><FontAwesomeIcon icon={faArrowRight} /> Outbound</>)
                          }
                        </td>
                        <td className="align-middle text-center text-nowrap ">
                          <TimePoint scheduleData={item.stop_times[0]} updateData={stopTimeUpdate}></TimePoint>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <TimePointLegend></TimePointLegend>
            </div>
          </>
        )}
        {trips.length === 0 && (
          <div className="alert alert-info">
            <div className="d-flex flex-wrap align-items-center">
              <div className="flex-grow-1">
                No trips scheduled use <strong>{stop.stop_name}</strong> for selected date.
              </div>
              <div>
                {typeof handleDateFieldChange === 'function' && (
                  <DateSelector scheduleDate={scheduleDate} handleDateFieldChange={handleDateFieldChange} isLoading={isLoadingTripDate} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Stops;

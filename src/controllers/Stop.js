

import React, { useEffect, useRef, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { getJSON, isTimeLaterThanNow } from './../util.js';
import DataFetchError from '../components/DataFetchError';
import StopMap from '../components/StopMap';
import MapLinks from '../components/MapLinks';
import { Link, useParams } from 'react-router-dom';
import TitleBar from '../components/TitleBar';
import AlertList from '../components/AlertList';
import TransitRouteHeader from '../components/TransitRouteHeader';
import StopTimeSequence from '../components/StopTimeSequence';
import TimePoint from '../components/TimePoint';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLandmark, faWarning } from '@fortawesome/free-solid-svg-icons';
import Footer from '../components/Footer';
import StopAccessibilityInformation from '../components/StopAccessibilityInformation';

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;
const REFRESH_ALERTS_TTL = 60 * 1000;
const REFRESH_TRIP_UPDATES_TTL = 60 * 1000;

function Stops() {
  const [alerts, setAlerts] = useState([]);
  const [tripUpdates, setTripUpdates] = useState([]);
  const [stop, setStop] = useState([]);
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isStopLoaded, setStopLoaded] = useState(false);
  const [isTripsLoaded, setTripsLoaded] = useState(false);
  const [isRoutesLoaded, setRoutesLoaded] = useState(false);
  const [isAlertsLoaded, setAlertsLoaded] = useState(false);
  const [isTripUpdatesLoaded, setTripUpdatesLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);
  const map = useRef(null);
  const params = useParams();

  // Consolidated check that things are ready to go
  const isUIReady = [isStopLoaded, isTripsLoaded, isRoutesLoaded, isAlertsLoaded, isTripUpdatesLoaded].every((a) => a === true);

  useEffect(() => {
    getJSON(GTFS_BASE_URL + '/stops/' + params.stop_code + '.json')
      .then((s) => setStop(s))
      .then(() => setStopLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(GTFS_BASE_URL + '/stops/' + params.stop_code + '/trips.json?per_page=1000')
      .then((t) => setTrips(t.data))
      .then(() => setTripsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(GTFS_BASE_URL + '/stops/' + params.stop_code + '/routes.json')
      .then((r) => setRoutes(r.data))
      .then(() => setRoutesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(GTFS_BASE_URL + '/realtime/alerts.json')
      .then((data) => setAlerts(data))
      .then(() => setAlertsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(GTFS_BASE_URL + '/realtime/trip_updates.json')
      .then((data) => setTripUpdates(data))
      .then(() => setTripUpdatesLoaded(true))
      .catch((error) => setDataFetchError(error));

    // Refresh alerts data at set interval
    const refreshAlertsInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(GTFS_BASE_URL + '/realtime/alerts.json')
        .then((data) => setAlerts(data))
        .catch((error) => setDataFetchError(error));
    }, REFRESH_ALERTS_TTL);

    const refreshTripUpdatesInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(GTFS_BASE_URL + '/realtime/trip_updates.json')
        .then((data) => setTripUpdates(data))
        .catch((error) => setDataFetchError(error));
    }, REFRESH_TRIP_UPDATES_TTL);

    // Run on unmount
    return () => {
      clearInterval(refreshAlertsInterval);
      clearInterval(refreshTripUpdatesInterval);
    };
  }, [isUIReady, params.stop_code]);

  if (dataFetchError) {
    return(<DataFetchError error={dataFetchError}></DataFetchError>);
  }

  if (!isUIReady) {
    return(<LoadingScreen></LoadingScreen>);
  }

  const mapControls = {
    topRight: (
      <div className="map-top-right-container">
        <MapLinks></MapLinks>
      </div>
    )
  };

  // Filter alerts to single stop
  let stopAlerts = [];
  alerts.forEach(a => {
    a.alert.informed_entity.forEach(e => {
      if (e.stop_id === stop.stop_code) {
        stopAlerts.push(a);
      }
    });
  });

  // Filter trip updates to a single stop
  let stopTripUpdates = [];
  tripUpdates.forEach(tu => {
    tu.trip_update.stop_time_update.forEach(u => {
      if (u.stop_id === stop.stop_code) {
        stopTripUpdates.push(tu);
      }
    });
  });

  // Sort trips by time at stop
  trips.sort((a, b) => {
    const aTime = a.stop_times[0].arrival_time ? a.stop_times[0].arrival_time : a.stop_times[0].departure_time;
    const bTime = b.stop_times[0].arrival_time ? b.stop_times[0].arrival_time : b.stop_times[0].departure_time;
    return aTime > bTime;
  });

  // Assign current stop to be rendered
  const stops = [stop];

  // If a parent station, sort and render additional stops
  if (stop.child_stops.length > 0) {
    stop.child_stops.sort((a, b) => a.stop_code > b.stop_code);
    stop.child_stops.map((item) => stops.push(item));
  }

  return(
    <div>
      <TitleBar></TitleBar>
      <div className="container">
        <div className="stop-name">{stop.stop_name}</div>
        {stopAlerts.length > 0 &&
          (<div className="p-2 mb-2 text-center bg-warning rounded-bottom" style={{marginTop: '-1em'}}><FontAwesomeIcon icon={faWarning} fixedWidth={true}></FontAwesomeIcon> System Alert at Stop</div>)
        }
        <div className="text-center p-2 mb-2">
          <div>{stop.stop_code} {stop.stop_desc}</div>
          {stop.parent_station_gid && (
            <div className="p-2 mb-2"><FontAwesomeIcon icon={faLandmark} fixedWidth={true}></FontAwesomeIcon> <strong>Inside <Link to={'/stops/' + stop.parent_station_gid}>{stop.parent_station.stop_name}</Link></strong></div>
          )}
        </div>
        <div className="text-center p-2 mb-2">
          <StopAccessibilityInformation stop={stop}></StopAccessibilityInformation>
        </div>
        {stop.child_stops.length > 0 && (
            <ul className="list-linline small">
              <li className="list-inline-item"><strong>Station Stops:</strong></li>
              {stop.child_stops.map((item) => {
                return(
                  <li key={item.id} className="list-inline-item"><Link to={'/stops/' + item.stop_code}>{item.stop_name}</Link></li>
                )
              })}
            </ul>
          )}
        {routes.length > 0 && (
          <>
            <div className="row mb-2">
              {routes.map((item) => {
                const routeAlerts = alerts.filter((a) => a.alert.informed_entity[0].route_id === item.route_gid);
                return(
                  <div key={item.id} className="col-md-4">
                    <TransitRouteHeader route={item} alerts={routeAlerts} showRouteType={true}></TransitRouteHeader>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <StopMap center={[stop.stop_lat, stop.stop_lon]} zoom={19} map={map} stops={stops} alerts={alerts} mapControls={mapControls}></StopMap>
        <AlertList alerts={stopAlerts} routes={routes}></AlertList>
        {trips.length > 0 && (
          <div className="table-responsive-md">
            <table className="table table-sm small">
              <thead>
                <tr>
                  <th>Seq.</th>
                  <th>Route</th>
                  <th>Trip</th>
                  <th>Headsign</th>
                  <th className="bg-dark text-light text-center">Time</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((item, _index) => {
                  const route = routes.find((r) => r.route_gid === item.route_gid);
                  const routeAlerts = alerts.filter((a) => a.alert.informed_entity[0].route_id === item.route_gid);
                  // Find stop time update relevant to this trip and this stop
                  let stopTimeUpdate = {};
                  if (stopTripUpdates.length > 0) {
                    const stopTimeTripUpdate = stopTripUpdates.filter((s) => s.trip_update.trip.trip_id === item.trip_gid);
                    if (stopTimeTripUpdate.length > 0) {
                      stopTimeTripUpdate[0].trip_update.stop_time_update.map((stu) => {
                        if (stu.stop_id === stop.stop_code) {
                          stopTimeUpdate = stu;
                        }
                      });
                    }
                  }
                  const rowStyle = {
                    opacity: isTimeLaterThanNow(item.stop_times[0].arrival_time || item.stop_times[0].departure_time) ? 1 : 0.3
                  };
                  return(
                    <tr key={item.id} style={rowStyle}>
                      <td className="text-center"><StopTimeSequence stopTime={item.stop_times[0]}></StopTimeSequence></td>
                      <td><TransitRouteHeader route={route} alerts={routeAlerts}></TransitRouteHeader></td>
                      <td><Link to={'/trips/' + item.trip_gid}>{item.trip_gid}</Link></td>
                      <td>
                        <strong>{item.trip_headsign}</strong><br />
                        {item.direction_id === "1" ? 'Inbound' : 'Outbound'}
                      </td>
                      <td className="text-center">
                        <TimePoint scheduleData={item.stop_times[0]} updateData={stopTimeUpdate}></TimePoint>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <caption><strong>Legend:</strong> <strike className="text-muted small">0:00 AM</strike> - Scheduled time has been updated. | <strong className="text-primary">0:00 AM</strong> - Updated with realtime trip information.</caption>
            </table>
          </div>
        )}
        {trips.length == 0 && (
          <div className="alert alert-info">No active trips use this stop.</div>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Stops;

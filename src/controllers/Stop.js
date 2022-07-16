

import React, { useEffect, useRef, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { formatDistanceTraveled, formatTripTime, getJSON, isTimeLaterThanNow } from './../util.js';
import DataFetchError from '../components/DataFetchError';
import StopMap from '../components/StopMap';
import MapLinks from '../components/MapLinks';
import { Link, useParams } from 'react-router-dom';
import TitleBar from '../components/TitleBar';
import AlertList from '../components/AlertList';
import TransitRouteHeader from '../components/TransitRouteHeader';
import StopTimeSequence from '../components/StopTimeSequence';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLandmark, faWarning } from '@fortawesome/free-solid-svg-icons';
import Footer from '../components/Footer';

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;
const REFRESH_ALERTS_TTL = 60 * 1000;

function Stops() {
  const [alerts, setAlerts] = useState([]);
  const [stop, setStop] = useState([]);
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isStopLoaded, setStopLoaded] = useState(false);
  const [isTripsLoaded, setTripsLoaded] = useState(false);
  const [isRoutesLoaded, setRoutesLoaded] = useState(false);
  const [isAlertsLoaded, setAlertsLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);
  const map = useRef();
  const params = useParams();

  // Consolidated check that things are ready to go
  const isUIReady = [isStopLoaded, isTripsLoaded, isRoutesLoaded, isAlertsLoaded].every((a) => a === true);

  useEffect(() => {
    getJSON(GTFS_BASE_URL + '/stops/' + params.stop_code + '.json')
      .then((s) => setStop(s))
      .then(() => setStopLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(GTFS_BASE_URL + '/stops/' + params.stop_code + '/trips.json?per_page=1000')
      .then((t) => setTrips(t.data))
      .then(() => setTripsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(GTFS_BASE_URL + '/routes.json')
      .then((r) => setRoutes(r.data))
      .then(() => setRoutesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(GTFS_BASE_URL + '/realtime/alerts.json')
      .then((data) => setAlerts(data))
      .then(() => setAlertsLoaded(true))
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

    // Run on unmount
    return () => {
      clearInterval(refreshAlertsInterval);
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

  // Sort trips by time at stop
  trips.sort((a, b) => {
    const aTime = a.stop_times[0].arrival_time ? a.stop_times[0].arrival_time : a.stop_times[0].departure_time;
    const bTime = b.stop_times[0].arrival_time ? b.stop_times[0].arrival_time : b.stop_times[0].departure_time;
    return aTime > bTime;
  });

  return(
    <div>
      <TitleBar></TitleBar>
      <div className="container">
        <div className="stop-name">{stop.stop_name}</div>
        {stopAlerts.length > 0 &&
          (<div className="p-2 mb-2 text-center bg-warning rounded-bottom" style={{marginTop: '-1em'}}><FontAwesomeIcon icon={faWarning} fixedWidth={true}></FontAwesomeIcon> System Alert at Stop</div>)
       }
        <div className="text-center p-2 mb-2">
          {stop.parent_station && (
            <><FontAwesomeIcon icon={faLandmark} fixedWidth={true}></FontAwesomeIcon> <em>Inside {stop.parent_station}</em> - </>
          )}
          {stop.stop_code} {stop.stop_desc}
        </div>
        <StopMap center={[stop.stop_lat, stop.stop_lon]} zoom={19} map={map} stops={[stop]} alerts={alerts} mapControls={mapControls}></StopMap>
        <AlertList alerts={stopAlerts} routes={routes}></AlertList>
        {trips.length > 0 && (
          <table className="table">
          <thead>
            <tr>
              <th>Sequence</th>
              <th>Route</th>
              <th>Trip</th>
              <th>Headsign</th>
              <th>Distance</th>
              <th>Direction</th>
              <th className="bg-secondary text-light text-center">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((item, _index) => {
              const route = routes.find((r) => r.route_gid === item.route_gid);
              const rowStyle = {
                opacity: isTimeLaterThanNow(item.stop_times[0].arrival_time || item.stop_times[0].departure_time) ? 1 : 0.3
              };
              return(
                <tr key={item.id} style={rowStyle}>
                  <td className="text-center"><StopTimeSequence stopTime={item.stop_times[0]}></StopTimeSequence></td>
                  <td><TransitRouteHeader route={route}></TransitRouteHeader></td>
                  <td><Link to={'/trips/' + item.trip_gid}>{item.trip_gid}</Link></td>
                  <td>{item.trip_headsign}</td>
                  <td>{formatDistanceTraveled(item.stop_times[0].shape_dist_traveled)}</td>
                  <td>{item.direction_id === "1" ? 'Inbound' : 'Outbound'}</td>
                  <td className="text-center">
                    {formatTripTime(item.stop_times[0].arrival_time)}
                    {item.stop_times[0].arrival_time !== item.stop_times[0].departure_time &&
                      (<> (Departs {formatTripTime(item.stop_times[0].departure_time)})</>)
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
        {trips.length == 0 && (
          <div className="alert alert-info">No trips use this stop.</div>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Stops;

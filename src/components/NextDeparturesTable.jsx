import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faBus, faTrain } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { getJSON } from '../util';
import TransitRouteHeader from './TransitRouteHeader';
import Headsign from './Headsign';

const GTFS_BASE_URL = import.meta.env.VITE_GTFS_BASE_URL;
const REFRESH_NEXT_DEPARTURES_TTL = 30 * 1000;

// Convert a GTFS HH:MM:SS time (may exceed 24h for after-midnight trips) into a Date for today
function parseGtfsTime(time) {
  if (!time) {
    return null;
  }
  const [hour, minute, second] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, second, 0);
  return date;
}

// Find the StopTimeUpdate for this trip at this stop within the realtime trip_updates feed
function findStopTimeUpdate(tripUpdates, tripGid, stopGid) {
  const tripUpdate = tripUpdates.find((tu) => tu.trip_update?.trip?.trip_id === tripGid);
  const stopTimeUpdates = tripUpdate?.trip_update?.stop_time_update || [];
  return stopTimeUpdates.find((stu) => stu.stop_id === stopGid) || null;
}

function getUpdateDate(stopTimeUpdate) {
  if (typeof stopTimeUpdate?.departure?.time === 'number') {
    return new Date(stopTimeUpdate.departure.time * 1000);
  }
  if (typeof stopTimeUpdate?.arrival?.time === 'number') {
    return new Date(stopTimeUpdate.arrival.time * 1000);
  }
  return null;
}

function getDelayStatus(scheduleDate, updateDate) {
  if (!updateDate) {
    return null;
  }
  const diffMinutes = Math.round((updateDate - scheduleDate) / 60000);
  if (diffMinutes === 0) {
    return 'On Time';
  }
  const absMinutes = Math.abs(diffMinutes);
  const unit = absMinutes === 1 ? 'minute' : 'minutes';
  return diffMinutes > 0 ? `${absMinutes} ${unit} late` : `${absMinutes} ${unit} early`;
}

// How long a departure is allowed to sit at "Due" before it's dropped from the list,
// in case the backend hasn't rolled it out of next_trip/upcoming_trips yet.
const DEPARTED_GRACE_PERIOD_MINUTES = 1;

function getEtaMinutes(date) {
  return Math.round((date - new Date()) / 60000);
}

function formatEta(diffMinutes) {
  if (diffMinutes <= 0) {
    return 'Due';
  }
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? 'in 1 minute' : `in ${diffMinutes} minutes`;
  }
  const hours = Math.round(diffMinutes / 60);
  return hours === 1 ? 'in 1 hour' : `in ${hours} hours`;
}

function NextDeparturesTable({ stopCode, stopGid, tripUpdates = [], vehiclePositions = [] }) {
  const [departures, setDepartures] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);

    const fetchNextDepartures = () => getJSON(`${GTFS_BASE_URL}/stops/${stopCode}/next.json`)
      .then((data) => {
        const upcoming = [data.next_trip, ...(data.upcoming_trips || [])].filter(Boolean);
        setDepartures(upcoming);
        setHasError(false);
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoaded(true));

    fetchNextDepartures();
    const refreshInterval = setInterval(fetchNextDepartures, REFRESH_NEXT_DEPARTURES_TTL);

    return () => clearInterval(refreshInterval);
  }, [stopCode]);

  // Enrich with realtime data, then drop any departure whose vehicle has already left the
  // stop, so a trip the backend hasn't rolled out of next.json yet doesn't stick on "Due".
  const visibleDepartures = departures.map(({ stop_time: stopTime, trip }) => {
    const scheduleDate = parseGtfsTime(stopTime.departure_time || stopTime.arrival_time);
    const stopTimeUpdate = findStopTimeUpdate(tripUpdates, trip.trip_gid, stopGid);
    const updateDate = getUpdateDate(stopTimeUpdate);
    const bestDate = updateDate || scheduleDate;
    return {
      trip,
      bestDate,
      delayStatus: getDelayStatus(scheduleDate, updateDate),
      etaMinutes: getEtaMinutes(bestDate),
    };
  }).filter(({ etaMinutes }) => etaMinutes > -DEPARTED_GRACE_PERIOD_MINUTES);

  if (!isLoaded || hasError || visibleDepartures.length === 0) {
    return null;
  }

  return (
    <div className="card my-3">
      <div className="card-header"><FontAwesomeIcon icon={faClock} fixedWidth={true} /> <strong>Next Departures</strong></div>
      <div className="card-body p-0">
        <table className="table table-sm small mb-0">
          <thead>
            <tr>
              <th>Time</th>
              <th>Route</th>
              <th className="bg-dark text-light text-center">ETA</th>
            </tr>
          </thead>
          <tbody>
            {visibleDepartures.map(({ trip, bestDate, delayStatus, etaMinutes }) => {
              const { route } = trip;
              const hasVehicleAssigned = vehiclePositions.some((vp) => vp.vehicle?.trip?.trip_id === trip.trip_gid);
              const vehicleIcon = route.route_type === '2' ? faTrain : faBus;

              return (
                <tr key={trip.trip_gid}>
                  <td className="align-middle text-nowrap">
                    {hasVehicleAssigned && (
                      <OverlayTrigger placement="top" overlay={<Tooltip>Vehicle tracked</Tooltip>}>
                        <span className="text-success me-1">
                          <FontAwesomeIcon icon={vehicleIcon} fixedWidth={true} />
                        </span>
                      </OverlayTrigger>
                    )}
                    <Link to={`/trips/${trip.trip_gid}`}>
                      {bestDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </Link>
                  </td>
                  <td className="align-middle" style={{ maxWidth: '200px' }}>
                    <TransitRouteHeader route={route}></TransitRouteHeader>
                    <Headsign headsign={trip.trip_headsign} />
                  </td>
                  <td className="align-middle text-center text-nowrap">
                    {formatEta(etaMinutes)}
                    {delayStatus && ` (${delayStatus})`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

NextDeparturesTable.propTypes = {
  stopCode: PropTypes.string.isRequired,
  stopGid: PropTypes.string,
  tripUpdates: PropTypes.array,
  vehiclePositions: PropTypes.array,
};

export default NextDeparturesTable;

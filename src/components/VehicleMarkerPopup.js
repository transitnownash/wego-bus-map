import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBus, faMap, faMapSigns, faCompass, faTachometer, faClock, faSpinner, faPeopleGroup,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import {
  isStopTimeUpdateLaterThanNow, renderBearing, renderSpeed, renderUnixTimestamp,
} from '../util';
import TransitRouteHeader from './TransitRouteHeader.js';
import StopCode from './StopCode.js';
import StopTimeSequence from './StopTimeSequence.js';
import TimePoint from './TimePoint.js';
import TripProgressBar from './TripProgressBar.js';
import Headsign from './Headsign.js';

function VehicleMarkerPopup({
  vehiclePositionData, trip, route, agency, tripUpdate, alerts,
}) {
  let isTripTabActive = false;

  const trip_headsign = (trip.trip_headsign)
    ? (<Headsign headsign={trip.trip_headsign} />)
    : (<>{route.route_long_name} <FontAwesomeIcon icon={faSpinner} spin={true}></FontAwesomeIcon></>);
  const trip_gid = (trip.trip_gid)
    ? (<Link to={`/trips/${trip.trip_gid}`}>{trip.trip_gid}</Link>)
    : (<>{vehiclePositionData.vehicle.trip.trip_id}</>);
  let tripStopTimes = [];
  if (trip.trip_gid && tripUpdate.trip_update && tripUpdate.trip_update.stop_time_update.length > 0) {
    isTripTabActive = true;
    tripStopTimes = trip.stop_times.filter((item) => {
      const updateTime = tripUpdate.trip_update.stop_time_update.find((i) => i.stop_sequence === item.stop_sequence) || {};
      if (!isStopTimeUpdateLaterThanNow(item, updateTime)) {
        return false;
      }
      return true;
    });
  }

  return (
    <Popup>
      <div className="popup-content" style={{ minWidth: '300px' }}>
        <TransitRouteHeader route={route} alerts={alerts} showRouteType={false}></TransitRouteHeader>
        <Tabs
          id="controlled-tab-example"
          className="mb-3"
          fill={true}
        >
          <Tab eventKey="home" title="Vehicle">
            <table className="table table-borderless table table-sm small" style={{ minWidth: '250px' }}>
              <tbody>
                <tr>
                  <th className="text-nowrap"><FontAwesomeIcon icon={faMapSigns} fixedWidth/> Headsign</th>
                  <td>{trip_headsign}</td>
                </tr>
                <tr>
                  <th><FontAwesomeIcon icon={faBus} fixedWidth/> Vehicle</th>
                  <td>{vehiclePositionData.vehicle.vehicle.label}</td>
                </tr>
                <tr>
                  <th><FontAwesomeIcon icon={faMap} fixedWidth/> Trip</th>
                  <td>{trip_gid}</td>
                </tr>
                <tr>
                  <th><FontAwesomeIcon icon={faCompass} fixedWidth/> Heading</th>
                  <td>{renderBearing(vehiclePositionData.vehicle.position.bearing)}</td>
                </tr>
                <tr>
                  <th><FontAwesomeIcon icon={faTachometer} fixedWidth/> Speed</th>
                  <td>{renderSpeed(vehiclePositionData.vehicle.position.speed)}</td>
                </tr>
                {vehiclePositionData.vehicle.occupancy_status && (
                  <tr>
                    <th><FontAwesomeIcon icon={faPeopleGroup} fixedWidth/> Occupancy</th>
                    <td>{vehiclePositionData.vehicle.occupancy_status}</td>
                  </tr>
                )}
                <tr>
                  <th><FontAwesomeIcon icon={faClock} fixedWidth/> Updated</th>
                  <td>{renderUnixTimestamp(vehiclePositionData.vehicle.timestamp)}</td>
                </tr>
              </tbody>
            </table>
            {trip.stop_times && tripUpdate && (
              <TripProgressBar trip={trip} tripUpdates={[tripUpdate]} />
            )}
          </Tab>
          <Tab eventKey="trip" title="Stop Times" disabled={!isTripTabActive} className='overflow-auto mb-2' style={{ maxHeight: '200px' }}>
            {isTripTabActive && (
              <table className="table table-sm table-striped small">
                <tbody>
                  {tripStopTimes.map((item) => {
                    const updateTime = tripUpdate.trip_update.stop_time_update.find((i) => i.stop_sequence === item.stop_sequence) || {};
                    return (
                      <tr key={item.id}>
                        <td><StopTimeSequence stopTime={item} /></td>
                        <td>
                          <div className="mb-1"><Link to={`/stops/${item.stop.stop_code}`}><strong>{item.stop.stop_name}</strong></Link></div>
                          <div className="small"><StopCode stop={item.stop} /> {item.stop.stop_desc}</div>
                        </td>
                        <td className="text-center text-nowrap"><TimePoint scheduleData={item} updateData={updateTime} /></td>
                      </tr>
                    );
                  })}
                  {tripStopTimes.length === 0 && (
                    <div className="alert bg-info text-bg-info">No upcoming stops for this trip.</div>
                  )}
                </tbody>
              </table>
            )}
          </Tab>
        </Tabs>
        <div className="text-end"><a href={agency.agency_url} className="text-muted" target="_blank" rel="noreferrer">{agency.agency_name}</a></div>
      </div>
    </Popup>
  );
}

VehicleMarkerPopup.propTypes = {
  vehiclePositionData: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  trip: PropTypes.object.isRequired,
  agency: PropTypes.object.isRequired,
  tripUpdate: PropTypes.object,
  alerts: PropTypes.array,
};

VehicleMarkerPopup.defaultProps = {
  tripUpdate: {},
  alerts: [],
};

export default VehicleMarkerPopup;

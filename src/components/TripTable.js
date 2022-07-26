import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TripTableRow from './TripTableRow';
import TripTableRowEmpty from './TripTableRowEmpty';
import HidePastTripsToggle from './HidePastTripsToggle';
import TimePointLegend from './TimePointLegend';

function TripTable({routeTrips, route, tripUpdates}) {
  const [hidePastTrips, setHidePastTrips] = useState(true);

  if (routeTrips.length === 0) {
    return(<div className="alert alert-info">No trips scheduled for <strong>{route.route_short_name} - {route.route_long_name}</strong> today.</div>);
  }

  const handleCheckboxChange = function(e) {
    setHidePastTrips(e.target.checked === true);
  };

  return(
    <>
      <HidePastTripsToggle hidePastTrips={hidePastTrips} onChange={handleCheckboxChange} />
      <div className="row">
        <div className="col-lg-6">
          <div className="h4">Inbound</div>
          <table className="table table-sm table-striped small">
            <thead>
              <tr>
                <th>Trip</th>
                <th className="text-center">Start</th>
                <th className="text-center">End</th>
                <th>Headsign</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {routeTrips.filter((t) => t.direction_id === '1').map((item, _index) => {
                const tripUpdate = tripUpdates.find((i) => item.trip_gid === i.trip_update.trip.trip_id) || {};
                return(<TripTableRow key={item.id} trip={item} route={route} hidePastTrips={hidePastTrips} tripUpdate={tripUpdate}></TripTableRow>);
              })}
              {routeTrips.filter((t) => t.direction_id === '1').length === 0 &&
                (<TripTableRowEmpty/>)
              }
            </tbody>
          </table>
        </div>
        <div className="col-lg-6">
          <div className="h4">Outbound</div>
          <table className="table table-sm table-striped small">
            <thead>
              <tr>
                <th>Trip</th>
                <th className="text-center">Start</th>
                <th className="text-center">End</th>
                <th>Headsign</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {routeTrips.filter((t) => t.direction_id !== '1').map((item, _index) => {
                const tripUpdate = tripUpdates.find((i) => item.trip_gid === i.trip_update.trip.trip_id) || {};
                return(<TripTableRow key={item.id} trip={item} route={route} hidePastTrips={hidePastTrips} tripUpdate={tripUpdate}></TripTableRow>);
              })}
              {routeTrips.filter((t) => t.direction_id !== '1').length === 0 &&
                (<TripTableRowEmpty></TripTableRowEmpty>)
              }
            </tbody>
          </table>
        </div>
      </div>
      <TimePointLegend></TimePointLegend>
    </>
  );
}

TripTable.propTypes = {
  routeTrips: PropTypes.array.isRequired,
  route: PropTypes.object.isRequired,
  tripUpdates: PropTypes.array
};

TripTable.defaultProps = {
  tripUpdates: []
};

export default TripTable;

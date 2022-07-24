import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TripTableRow from './TripTableRow';
import TripTableRowEmpty from './TripTableRowEmpty';
import HidePastTripsToggle from './HidePastTripsToggle';

function TripTable({routeTrips, route}) {
  const [hidePastTrips, setHidePastTrips] = useState(true);

  if (routeTrips.length === 0) {
    return(<div className="alert alert-info">No trips scheduled for <strong>{route.route_short_name} - {route.route_long_name}</strong> today.</div>);
  }

  const handleCheckboxChange = function(e) {
    setHidePastTrips(e.target.checked === true);
  };

  return(
    <>
      <HidePastTripsToggle hidePastTrips={hidePastTrips} onChange={handleCheckboxChange}></HidePastTripsToggle>
      <div className="row">
        <div className="col-md-6">
          <div className="h4">Inbound</div>
          <table className="table table-sm small">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Start</th>
                <th>End</th>
                <th>Headsign</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {routeTrips.filter((t) => t.direction_id === '1').map((item, _index) => {
                return(<TripTableRow key={item.id} trip={item} route={route} hidePastTrips={hidePastTrips}></TripTableRow>);
              })}
              {routeTrips.filter((t) => t.direction_id === '1').length === 0 &&
                (<TripTableRowEmpty></TripTableRowEmpty>)
              }
            </tbody>
          </table>
        </div>
        <div className="col-md-6">
          <div className="h4">Outbound</div>
          <table className="table table-sm small">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Start</th>
                <th>End</th>
                <th>Headsign</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {routeTrips.filter((t) => t.direction_id !== '1').map((item, _index) => {
                return(<TripTableRow key={item.id} trip={item} route={route} hidePastTrips={hidePastTrips}></TripTableRow>);
              })}
              {routeTrips.filter((t) => t.direction_id !== '1').length === 0 &&
                (<TripTableRowEmpty></TripTableRowEmpty>)
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

TripTable.propTypes = {
  routeTrips: PropTypes.array.isRequired,
  route: PropTypes.object.isRequired
};

TripTable.defaultProps = {
  routeTrips: [],
  route: {}
};

export default TripTable;

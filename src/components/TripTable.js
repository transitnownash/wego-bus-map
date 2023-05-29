import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TripTableRow from './TripTableRow';
import TripTableRowEmpty from './TripTableRowEmpty';
import HidePastTripsToggle from './HidePastTripsToggle';
import TimePointLegend from './TimePointLegend';
import DateSelector from './DateSelector';

function TripTable({
  routeTrips, route, tripUpdates, scheduleDate, handleDateFieldChange, isLoadingTripDate,
}) {
  const [hidePastTrips, setHidePastTrips] = useState(true);

  if (routeTrips.length === 0) {
    return (
      <>
        <div className="alert alert-info">
          <div className="d-flex flex-wrap align-items-center">
            <div className="flex-grow-1">
              No trips scheduled for <strong>{route.route_short_name} - {route.route_long_name}</strong> for selected date.
            </div>
            <div>
              {typeof handleDateFieldChange === 'function' && (
                <DateSelector scheduleDate={scheduleDate} handleDateFieldChange={handleDateFieldChange} isLoading={isLoadingTripDate} />
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleCheckboxChange = function (e) {
    setHidePastTrips(e.target.checked === true);
  };

  return (
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
                return (<TripTableRow key={item.id} trip={item} route={route} hidePastTrips={hidePastTrips} tripUpdate={tripUpdate}></TripTableRow>);
              })}
              {routeTrips.filter((t) => t.direction_id === '1').length === 0
                && (<TripTableRowEmpty/>)
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
                return (<TripTableRow key={item.id} trip={item} route={route} hidePastTrips={hidePastTrips} tripUpdate={tripUpdate}></TripTableRow>);
              })}
              {routeTrips.filter((t) => t.direction_id !== '1').length === 0 && (
                <TripTableRowEmpty />
              )}
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
  tripUpdates: PropTypes.array,
  scheduleDate: PropTypes.any,
  handleDateFieldChange: PropTypes.any,
  isLoadingTripDate: PropTypes.bool,
};

TripTable.defaultProps = {
  tripUpdates: [],
  isLoadingTripDate: false,
};

export default TripTable;

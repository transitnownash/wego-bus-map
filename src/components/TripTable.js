import React from 'react'
import PropTypes from 'prop-types'
import TripTableRow from './TripTableRow'

function TripTable({routeTrips, route}) {
  if (routeTrips.length === 0) {
    return(<div className="alert alert-info">No trips scheduled for {route.route_long_name} today.</div>)
  }

  return(
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
            {routeTrips.map((item, _index) => {
              if (item.direction_id !== '1') {
                return false
              }
              return(<TripTableRow key={item.id} trip={item} route={route}></TripTableRow>)
            })}
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
            {routeTrips.map((item, _index) => {
              if (item.direction_id === '1') {
                return false
              }
              return(<TripTableRow key={item.id} trip={item} route={route}></TripTableRow>)
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

TripTable.propTypes = {
  routeTrips: PropTypes.array,
  route: PropTypes.object
}

TripTable.defaultProps = {
  routeTrips: [],
  route: {}
}

export default TripTable

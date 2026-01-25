import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import AlertItem from './AlertItem';
import dayjs from 'dayjs';

function AlertList({ alerts, routes, showHorizontal }) {
  const [hideFuture, setHideFuture] = useState(false);

  const handleHideFutureAlertsOnChange = (event) => {
    setHideFuture(event.target.checked);
  };

  const futureAlerts = alerts.filter((item) => {
    return dayjs().isBefore(dayjs.unix(item.alert.active_period[0].start));
  });

  alerts = alerts.sort((a, b) => {
    if (a.alert.informed_entity[0].route_id === b.alert.informed_entity[0].route_id) {
      return a.id > b.id;
    }
    return parseInt(a.alert.informed_entity[0].route_id, 10) - parseInt(b.alert.informed_entity[0].route_id, 10);
  });

  if (hideFuture) {
    alerts = alerts.filter((item) => dayjs().isAfter(dayjs.unix(item.alert.active_period[0].start)));
    console.log(alerts);
  }

  return (
    <div>
      {futureAlerts.length > 0 && (
        <div className="my-2">
          <Form.Check
            type="switch"
            id="hide-future-alerts"
            label={`Hide future alerts (${futureAlerts.length})`}
            onChange={handleHideFutureAlertsOnChange}
          />
        </div>
      )}
      {alerts.length === 0 && (
        <div className='alert alert-info'>No active alerts.</div>
      )}
      <div className="row">
        {alerts.map((item, _index) => {
          const columnWrapperClass = showHorizontal ? `col-md-6 col-xl-4` : `col-12`;
          const entityRouteIds = Array.isArray(item.alert.informed_entity)
            ? item.alert.informed_entity
              .filter((ie) => typeof ie.route_id !== 'undefined')
              .map((ie) => String(ie.route_id))
            : [];
          const route = routes.find((r) => entityRouteIds.some((rid) => rid === String(r.route_gid) || rid === String(r.route_short_name)));
          return (
            <div key={item.id} className={columnWrapperClass}>
              <AlertItem alert={item.alert} route={route}></AlertItem>
            </div>
          );
        })}
      </div>
    </div>
  );
}

AlertList.propTypes = {
  alerts: PropTypes.array.isRequired,
  routes: PropTypes.array,
  showHorizontal: PropTypes.bool
};

AlertList.defaultProps = {
  alerts: [],
  routes: [],
  showHorizontal: false,
};

export default AlertList;

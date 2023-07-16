import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import AlertItem from './AlertItem';
import dayjs from 'dayjs';

function AlertList({ alerts, routes }) {
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
      {alerts.map((item, _index) => {
        const route = routes.find((r) => r.route_gid === item.alert.informed_entity[0].route_id || r.route_short_name === item.alert.informed_entity[0].route_id);
        return (
          <AlertItem key={item.id} alert={item.alert} route={route}></AlertItem>
        );
      })}
    </div>
  );
}

AlertList.propTypes = {
  alerts: PropTypes.array.isRequired,
  routes: PropTypes.array,
};

AlertList.defaultProps = {
  routes: [],
};

export default AlertList;

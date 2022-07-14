import React from 'react';
import PropTypes from 'prop-types';
import AlertItem from './AlertItem';

function AlertList({alerts, routes}) {
  alerts = alerts.sort((a, b) => {
    return parseInt(a.alert.informed_entity[0].route_id, 10) > parseInt(b.alert.informed_entity[0].route_id, 10);
  });
  return(
    <div>
      {alerts.map((item, _index) => {
        let route = routes.find(r => r.route_gid === item.alert.informed_entity[0].route_id);
        return(
          <AlertItem key={item.id} alert={item.alert} route={route}></AlertItem>
        );
      })}
    </div>
  );
}

AlertList.propTypes = {
  alerts: PropTypes.array.isRequired,
  routes: PropTypes.array
};

AlertList.defaultProps = {
  routes: []
};

export default AlertList;

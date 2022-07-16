import React from 'react';
import PropTypes from 'prop-types';
import {formatTimestamp, isHexLight} from './../util.js';
import './AlertItem.scss';
import { Link } from 'react-router-dom';

function AlertItem({alert, route}) {
  const alertStyle = {
    borderColor: (route.route_color) ? '#' + route.route_color : '#eee',
    backgroundColor: (route.route_color) ? '#' + route.route_color : '#eee',
    color: isHexLight(route.route_color) ? '#000' : '#FFF'
  };

  const alert_cause = (typeof alert.cause !== 'undefined')
    ? (<>{alert.cause} - </>)
    : (<></>);

  const alert_effect = (typeof alert.effect !== 'undefined')
    ? (<>{alert.effect} - </>)
    : (<></>);

  return(
    <div className="card mb-3" style={alertStyle}>
      <div className="card-header alert-item-header">
        <strong><Link to={'/routes/' + route.route_short_name}>{route.route_short_name} - {route.route_long_name}</Link></strong>
      </div>
      <div className="card-body bg-light text-dark alert-item-text">
        <p>
          <strong>{alert.header_text.translation[0].text}</strong>
        </p>
        {alert.description_text.translation[0].text}
      </div>
      <div className="card-footer alert-item-footer">
        {alert_cause}
        {alert_effect}
        <strong>Start:</strong> {formatTimestamp(alert.active_period[0].start)}
        {(alert.active_period[0].end && alert.active_period[0].end < 32503701600)&&
          <>&nbsp;-&nbsp;<strong>End:</strong> {formatTimestamp(alert.active_period[0].end)}</>
        }
      </div>
    </div>
  );
}

AlertItem.propTypes = {
  alert: PropTypes.object.isRequired,
  route: PropTypes.object
};

AlertItem.defaultProps = {
  route: {
    route_color: '#999',
    route_long_name: 'Route Unavailable',
    route_short_name: '00'
  }
};

export default AlertItem;

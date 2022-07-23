import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import busIcon from '../resources/bus.svg';
import trainIcon from '../resources/train.svg';
import { OverlayTrigger } from 'react-bootstrap';
import { Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './TransitRouteHeader.scss';

function TransitRouteHeader({route, alerts, showRouteType}) {
  if (typeof route !== 'object' || !route.route_short_name) {
    return(<div className="transit-route-header">Invalid route!</div>);
  }

  const routeStyle = {
    backgroundColor: '#' + route.route_color,
    color: '#' + route.route_text_color
  };

  let vehicleIcon = busIcon;
  if (route.route_type === "2") {
    vehicleIcon = trainIcon;
  }

  return(
    <div className="transit-route-header d-flex" style={routeStyle} title={route.route_desc}>
      {showRouteType && (
        <div>
          <img className="me-2" style={{height: '1.5rem'}} src={vehicleIcon} alt="Icon" title={'Route Type: ' + route.route_type } />
        </div>
      )}
      <div className="flex-grow-1 align-bottom">
        <Link to={'/routes/' + route.route_short_name}>{route.route_short_name} - {route.route_long_name}</Link>
      </div>
      <div>
        {alerts.length > 0 && (
          <div className="ms-2">
            <OverlayTrigger placement={'top'} overlay={<Tooltip>{alerts.length > 1 ? alerts.length + ' alerts' : '1 alert'}</Tooltip>}>
              <FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true}></FontAwesomeIcon>
            </OverlayTrigger>
          </div>
        )}
      </div>
    </div>
  );
}

TransitRouteHeader.propTypes = {
  route: PropTypes.object.isRequired,
  alerts: PropTypes.array,
  showRouteType: PropTypes.bool
};

TransitRouteHeader.defaultProps = {
  alerts: [],
  showRouteType: false
};

export default TransitRouteHeader;

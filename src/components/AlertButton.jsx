import React from 'react';
import PropTypes from 'prop-types';

function AlertButton({ alerts, buttonAction }) {
  if (alerts.length > 0) {
    return (
      <button className="btn btn-sm btn-primary bg-dark" onClick={buttonAction}>
          <span className="badge bg-light text-dark">
            {alerts.length}
          </span>&nbsp;
          Service Alerts
      </button>
    );
  }
}

AlertButton.propTypes = {
  alerts: PropTypes.array.isRequired,
  buttonAction: PropTypes.func.isRequired,
};

AlertButton.defaultProps = {
  alerts: [],
};

export default AlertButton;

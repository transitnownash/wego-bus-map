import React from 'react';
import PropTypes from 'prop-types';
import { faWheelchair, faQuestionCircle, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function StopAccessibilityInformation({ stop }) {
  let wheelchair_boarding = '';
  switch (stop.wheelchair_boarding) {
    case '1':
      wheelchair_boarding = (
        <span className="me-2">
          <FontAwesomeIcon icon={faWheelchair} fixedWidth={true}></FontAwesomeIcon> Some vehicles at this stop can be boarded by a rider in a wheelchair.
        </span>
      );
      break;

    case '2':
      wheelchair_boarding = (
        <>
          <span className="fa-layers fa-fw me-1">
            <FontAwesomeIcon icon={faWheelchair} fixedWidth={true} transform="shrink-7"></FontAwesomeIcon>
            <FontAwesomeIcon icon={faBan} fixedWidth={true} className="text-danger"></FontAwesomeIcon>
          </span>
          Wheelchair boarding is not possible at this stop.
        </>
      );
      break;

    case '0':
    default:
      wheelchair_boarding = (
        <>
          <span className="fa-layers fa-fw me-1">
            <FontAwesomeIcon icon={faQuestionCircle} fixedWidth={true} className="text-warning"></FontAwesomeIcon>
          </span>
          No accessibility information for the stop.
        </>
      );
      break;
  }

  return wheelchair_boarding;
}

StopAccessibilityInformation.propTypes = {
  stop: PropTypes.object.isRequired,
};

export default StopAccessibilityInformation;

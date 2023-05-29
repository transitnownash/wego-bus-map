import React from 'react';
import PropTypes from 'prop-types';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function LocateButton({ buttonAction }) {
  if (!navigator.geolocation) {
    return null;
  }
  return (
    <button className="btn btn-sm bg-dark text-light ms-2" onClick={buttonAction}><FontAwesomeIcon icon={faLocationArrow} fixedWidth={true}></FontAwesomeIcon></button>
  );
}

LocateButton.propTypes = {
  buttonAction: PropTypes.func,
};

LocateButton.defaultProps = {
  buttonAction: () => { console.error('No buttonAction set!'); },
};

export default LocateButton;

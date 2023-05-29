import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { faRoute, faInfoCircle, faBicycle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../resources/logo.svg';

function TitleBar({ hide }) {
  if (hide) {
    return;
  }
  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 navbar-dark bg-dark border-bottom shadow-sm">
          <Link to="/" className="text-light h3 mb-0"><img src={logo} width="30" height="30" className="d-inline-block align-top me-2" alt="Bus" /> WeGo Transit Map</Link>
        <div className="h5 my-0 me-md-auto">
        </div>
        <nav className="my-2 my-md-0 mr-md-3">
          <Link className="p-2 text-light" to="/about"><FontAwesomeIcon icon={faInfoCircle} fixedWidth={true} /> About</Link>
          <Link className="p-2 text-light" to="/routes"><FontAwesomeIcon icon={faRoute} fixedWidth={true} /> Routes</Link>
          <Link className="p-2 text-light" to="/bcycle"><FontAwesomeIcon icon={faBicycle} fixedWidth={true} /> BCycle</Link>
        </nav>
      </div>
    </div>
  );
}

TitleBar.propTypes = {
  hide: PropTypes.bool,
};

TitleBar.defaultProps = {
  hide: false,
};

export default TitleBar;

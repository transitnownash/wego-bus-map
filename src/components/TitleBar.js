import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom';
import { faRoute, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../resources/logo.svg';

function TitleBar({hide}) {
  if (hide) {
    return
  }
  return(
    <div>
      <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 navbar-dark bg-dark border-bottom shadow-sm">
          <Link to="/" className="text-light h3"><img src={logo} width="30" height="30" className="d-inline-block align-top me-2" alt="Bus" /> WeGo Transit Map</Link>
        <div className="h5 my-0 me-md-auto">
        </div>
        <nav className="my-2 my-md-0 mr-md-3">
          <Link className="p-2 text-light" to="/about"><FontAwesomeIcon icon={faInfoCircle} fixedWidth={true} /> About</Link>
          <Link className="p-2 text-light" to="/routes"><FontAwesomeIcon icon={faRoute} fixedWidth={true} /> Routes</Link>
          <a className="p-2 text-light" href="https://github.com/transitnownash/wego-bus-map" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faGithub} fixedWidth={true} /> View on GitHub</a>
        </nav>
        <Link className="btn btn-outline-light" to="/">Return to App</Link>
      </div>
    </div>
  )
}

TitleBar.propTypes = {
  hide: PropTypes.bool
}

TitleBar.defaultProps = {
  hide: false
}

export default TitleBar

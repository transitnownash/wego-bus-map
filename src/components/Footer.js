import React from 'react';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <div className="my-4">
      <ul className="nav justify-content-center">
        <li className="nav-item">
          <Link className="nav-link" to='/'>Main Map</Link>
        </li>
        <li className="vr"></li>
        <li className="nav-item">
          <Link className="nav-link" to='/about'>About</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to='/routes'>Routes</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to='/bcycle'>BCycle</Link>
        </li>
        <li className="vr"></li>
        <li className="nav-item">
          <a className="nav-link" target="_blank" href="https://github.com/transitnownash/wego-bus-map" rel="noreferrer"><FontAwesomeIcon icon={faGithub} fixedWidth={true}></FontAwesomeIcon></a>
        </li>
      </ul>
    </div>
  );
}

export default Footer;

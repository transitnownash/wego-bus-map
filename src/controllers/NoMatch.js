import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Footer from '../components/Footer';
import TitleBar from '../components/TitleBar';

function NoMatch() {
  return (
    <div>
      <TitleBar></TitleBar>
      <div className="container my-5 p-5 text-center">
        <h1><FontAwesomeIcon icon={faExclamationTriangle} /> Detour in Effect</h1>
        <p className="lead my-3">(You seem to have wandered off the route.)</p>
        <p>The content you were are looking for is not here.</p>
        <p>
          <Link to="/">Go to the Main Map</Link>
        </p>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default NoMatch;

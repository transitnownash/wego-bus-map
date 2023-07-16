import { React } from 'react';
import PropTypes from 'prop-types';
import TitleBar from './TitleBar';
import logo from '../resources/logo.svg';
import './LoadingScreen.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

function LoadingScreen({ hideTitleBar }) {
  return (
    <div>
      <TitleBar hide={hideTitleBar}></TitleBar>
      <div className="loading-screen">
        <div className="m-4"><img src={logo} className="loading-screen-logo" alt="Logo"/></div>
        <div className="h3 mb-3"><FontAwesomeIcon icon={faMusic} bounce className='text-dark' /> The wheels on the bus go ... <FontAwesomeIcon icon={faMusic} bounce className='text-dark' /></div>
      </div>
    </div>
  );
}

LoadingScreen.propTypes = {
  hideTitleBar: PropTypes.bool,
};

LoadingScreen.defaultProps = {
  hideTitleBar: false,
};

export default LoadingScreen;

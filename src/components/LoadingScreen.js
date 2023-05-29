import { React } from 'react';
import PropTypes from 'prop-types';
import TitleBar from './TitleBar';
import logo from '../resources/logo.svg';
import './LoadingScreen.scss';

function LoadingScreen({ hideTitleBar }) {
  return (
    <div>
      <TitleBar hide={hideTitleBar}></TitleBar>
      <div className="loading-screen">
        <div className="m-4"><img src={logo} className="loading-screen-logo" alt="Logo"/></div>
        <div className="h2 mb-3">Loading ...</div>
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

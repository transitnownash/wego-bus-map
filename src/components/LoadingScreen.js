import { React } from 'react';
import PropTypes from 'prop-types';
import TitleBar from './TitleBar';
import './LoadingScreen.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

function LoadingScreen({ hideTitleBar }) {
  return (
    <div>
      <TitleBar hide={hideTitleBar}></TitleBar>
      <div className="loading-screen">
        <a href="https://transit.nashville.gov/">
          <img src="/campaigns/2024-choose-how-you-move.png" alt="Choose How You Move Campaign" className="img-fluid rounded" />
        </a>
        <div className="h3 my-3">
          <FontAwesomeIcon icon={faSpinner} spin opacity={0.5} /> Loading ...
        </div>
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



import React, { useEffect, useRef, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { getJSON } from './../util.js';
import DataFetchError from '../components/DataFetchError';
import LocateButton from '../components/LocateButton';
import MapLinks from '../components/MapLinks';
import TransitMap from '../components/TransitMap';

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;
const REFRESH_ALERTS_TTL = 60 * 1000;

function Stops() {
  const [alerts, setAlerts] = useState([]);
  const [stops, setStops] = useState([]);
  const [isStopsLoaded, setStopsLoaded] = useState(false);
  const [isAlertsLoaded, setAlertsLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);
  const map = useRef(null);

  // Consolidated check that things are ready to go
  const isUIReady = [isStopsLoaded, isAlertsLoaded].every((a) => a === true);

  useEffect(() => {
    getJSON(GTFS_BASE_URL + '/stops.json?per_page=2000')
      .then((s) => setStops(s.data))
      .then(() => setStopsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(GTFS_BASE_URL + '/realtime/alerts.json')
      .then((data) => setAlerts(data))
      .then(() => setAlertsLoaded(true))
      .catch((error) => setDataFetchError(error));

    // Refresh alerts data at set interval
    const refreshAlertsInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(GTFS_BASE_URL + '/realtime/alerts.json')
        .then((data) => setAlerts(data))
        .catch((error) => setDataFetchError(error));
    }, REFRESH_ALERTS_TTL);

    // Run on unmount
    return () => {
      clearInterval(refreshAlertsInterval);
    };
  }, [isUIReady]);

  if (dataFetchError) {
    return(<DataFetchError error={dataFetchError}></DataFetchError>);
  }

  if (!isUIReady) {
    return(<LoadingScreen hideTitleBar={true}></LoadingScreen>);
  }

  const mapControls = {
    topRight: (
      <div className="map-top-right-container">
        <MapLinks />
      </div>
    ),
    bottomLeft: (
      <div className="d-flex map-bottom-left-container">
        <LocateButton buttonAction={() => locateUserOnMap(map)}></LocateButton>
      </div>
    )
  };

  const locateUserOnMap = function(map) {
    if (typeof map.current !== 'undefined' && map.current) {
      map.current.locate();
    }
  };

  const routeStops = stops.map((item) => {
    return { id: item.id, stop: item };
  });

  return(
    <div className="stops">
      <TransitMap map={map} routeStops={routeStops} alerts={alerts} mapControls={mapControls}></TransitMap>
    </div>
  );
}

export default Stops;

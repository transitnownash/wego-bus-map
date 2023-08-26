import React, { useEffect, useRef, useState } from 'react';
import TransitMap from '../components/TransitMap';
import MapLinks from '../components/MapLinks';
import LocateButton from '../components/LocateButton';
import LoadingScreen from '../components/LoadingScreen';
import AlertModal from '../components/AlertModal';
import AlertButton from '../components/AlertButton';
import { getJSON } from '../util';
import DataFetchError from '../components/DataFetchError';

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;
const GBFS_BASE_URL = 'https://gbfs.bcycle.com/bcycle_nashville';
const REFRESH_VEHICLE_POSITIONS_TTL = 7 * 1000;
const REFRESH_ALERTS_TTL = 60 * 1000;
const REFRESH_TRIP_UPDATES_TTL = 60 * 1000;
const REFRESH_GBFS_TTL = 60 * 1000;

function Main() {
  const [routes, setRouteData] = useState([]);
  const [agencies, setAgencyData] = useState([]);
  const [vehicleMarkers, setVehicleMarkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tripUpdates, setTripUpdates] = useState([]);
  const [bCycleStations, setBCycleStationData] = useState([]);
  const [bCycleStationsStatus, setBCycleStationStatusData] = useState([]);
  const [isRoutesLoaded, setRoutesLoaded] = useState(false);
  const [isAlertLoaded, setAlertLoaded] = useState(false);
  const [isTripUpdateLoaded, setTripUpdateLoaded] = useState(false);
  const [isAgencyLoaded, setAgencyLoaded] = useState(false);
  const [isVehiclePositionLoaded, setVehiclePositionLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);
  const [alertModalShow, setAlertModalShow] = useState(false);
  const map = useRef(null);

  // Consolidated check that things are ready to go
  const isUIReady = [isRoutesLoaded, isAlertLoaded, isTripUpdateLoaded, isAgencyLoaded, isVehiclePositionLoaded].every((a) => a === true);

  useEffect(() => {
    getJSON(`${GTFS_BASE_URL}/routes.json`)
      .then((r) => setRouteData(r.data))
      .then(() => setRoutesLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/agencies.json`)
      .then((a) => setAgencyData(a.data))
      .then(() => setAgencyLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
      .then((data) => setAlerts(data))
      .then(() => setAlertLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/trip_updates.json`)
      .then((data) => setTripUpdates(data))
      .then(() => setTripUpdateLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GTFS_BASE_URL}/realtime/vehicle_positions.json`)
      .then((data) => setVehicleMarkers(data))
      .then(() => setVehiclePositionLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GBFS_BASE_URL}/station_information.json`)
      .then((s) => setBCycleStationData(s.data.stations))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GBFS_BASE_URL}/station_status.json`)
      .then((s) => setBCycleStationStatusData(s.data.stations))
      .catch((error) => setDataFetchError(error));

    // Refresh position data at set interval
    const refreshPositionsInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(`${GTFS_BASE_URL}/realtime/vehicle_positions.json`)
        .then((data) => setVehicleMarkers(data));
    }, REFRESH_VEHICLE_POSITIONS_TTL);

    // Refresh alerts at a set interval
    const refreshAlertsInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(`${GTFS_BASE_URL}/realtime/alerts.json`)
        .then((data) => setAlerts(data))
        .catch((error) => setDataFetchError(error));
    }, REFRESH_ALERTS_TTL);

    // Refresh trip updates at a set interval
    const refreshTripUpdatesInterval = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(`${GTFS_BASE_URL}/realtime/trip_updates.json`)
        .then((data) => setTripUpdates(data))
        .catch((error) => setDataFetchError(error));
    }, REFRESH_TRIP_UPDATES_TTL);

    // Refresh BCycle station status at a set interval
    const refreshBCycleStatus = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(`${GBFS_BASE_URL}/station_status.json`)
        .then((s) => setBCycleStationStatusData(s.data.stations));
    }, REFRESH_GBFS_TTL);

    // Run on unmount
    return () => {
      clearInterval(refreshPositionsInterval);
      clearInterval(refreshAlertsInterval);
      clearInterval(refreshTripUpdatesInterval);
      clearInterval(refreshBCycleStatus);
    };
  }, [isUIReady]);

  if (dataFetchError) {
    return (<DataFetchError error={dataFetchError}></DataFetchError>);
  }

  const locateUserOnMap = function (map) {
    if (typeof map.current !== 'undefined' && map.current) {
      map.current.locate();
    }
  };

  // Remove invalid alerts (no informed entity)
  const allAlerts = alerts.filter((a) => typeof a.alert.informed_entity !== 'undefined');

  // Combine BCycle data into one hash
  if (bCycleStations.length > 0 && bCycleStationsStatus.length > 0) {
    bCycleStations.forEach((station, index) => {
      bCycleStations[index].status = bCycleStationsStatus.find((s) => station.station_id === s.station_id);
    });
  }

  const mapControls = {
    topRight: (
      <div className="map-top-right-container">
        <MapLinks />
      </div>
    ),
    bottomLeft: (
      <div className="d-flex map-bottom-left-container">
        <AlertButton alerts={allAlerts} buttonAction={() => setAlertModalShow(true)}></AlertButton>
        <LocateButton buttonAction={() => locateUserOnMap(map)}></LocateButton>
      </div>
    ),
  };

  return (
    (!isUIReady) ? (
      <LoadingScreen hideTitleBar={true}></LoadingScreen>
    ) : (
      <div className="main">
        <TransitMap routes={routes} agencies={agencies} vehicleMarkers={vehicleMarkers} shapes={[]} alerts={allAlerts} tripUpdates={tripUpdates} map={map} bCycleStations={bCycleStations} mapControls={mapControls}></TransitMap>
        <AlertModal alerts={allAlerts} show={alertModalShow} onHide={() => setAlertModalShow(false)} routes={routes}></AlertModal>
      </div>
    )
  );
}

export default Main;

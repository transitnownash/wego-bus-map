import React, { useEffect, useRef, useState } from 'react';
import TransitMap from '../components/TransitMap';
import MapLinks from '../components/MapLinks';
import LocateButton from '../components/LocateButton';
import LoadingScreen from '../components/LoadingScreen';
import AlertModal from '../components/AlertModal';
import AlertButton from '../components/AlertButton';
import { format_position_data } from '../util';

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;
const GBFS_BASE_URL = 'https://gbfs.bcycle.com/bcycle_nashville'
const REFRESH_VEHICLE_POSITIONS_TTL = 7 * 1000;
const REFRESH_ALERTS_TTL = 60 * 1000;
const REFRESH_GBFS_TTL = 60 * 1000

function Main() {
  const [routes, setRouteData] = useState([])
  const [agencies, setAgencyData] = useState([])
  const [vehicleMarkers, setVehicleMarkers] = useState([])
  const [alerts, setAlerts] = useState([])
  const [bCycleStations, setBCycleStationData] = useState([])
  const [bCycleStationsStatus, setBCycleStationStatusData] = useState([])
  const [isRoutesLoaded, setRoutesLoaded] = useState(false)
  const [isAlertLoaded, setAlertLoaded] = useState(false)
  const [isAgencyLoaded, setAgencyLoaded] = useState(false)
  const [isVehiclePositionLoaded, setVehiclePositionLoaded] = useState(false)

  const [alertModalShow, setAlertModalShow] = useState(false)
  const map = useRef(null)

  useEffect(() => {
    fetch(GTFS_BASE_URL + '/routes.json')
      .then((res) => res.json())
      .then((r) => setRouteData(r.data))
      .then(() => setRoutesLoaded(true));

    fetch(GTFS_BASE_URL + '/agencies.json')
      .then((res) => res.json())
      .then((a) => setAgencyData(a.data))
      .then(() => setAgencyLoaded(true));

    fetch(GTFS_BASE_URL + '/realtime/alerts.json')
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .then(() => setAlertLoaded(true));

    fetch(GTFS_BASE_URL + '/realtime/vehicle_positions.json')
      .then((res) => res.json())
      .then(function (data) {
        return format_position_data(data)
      })
      .then((data) => setVehicleMarkers(data))
      .then(() => setVehiclePositionLoaded(true));

    fetch(GBFS_BASE_URL + '/station_information.json')
      .then((res) => res.json())
      .then((s) => setBCycleStationData(s.data.stations))

    fetch(GBFS_BASE_URL + '/station_status.json')
      .then((res) => res.json())
      .then((s) => setBCycleStationStatusData(s.data.stations))

    // Refresh position data at set interval
    const refreshPositionsInterval = setInterval(() => {
      fetch(GTFS_BASE_URL + '/realtime/vehicle_positions.json')
        .then((res) => res.json())
        .then(function (data) {
          return format_position_data(data)
        })
        .then((data) => setVehicleMarkers(data))
    }, REFRESH_VEHICLE_POSITIONS_TTL);

    // Refresh alerts at a set interval
    const refreshAlertsInterval = setInterval(() => {
      fetch(GTFS_BASE_URL + '/realtime/alerts.json')
        .then((res) => res.json())
        .then((data) => setAlerts(data));
    }, REFRESH_ALERTS_TTL);

    // Refresh BCycle station status at a set interval
    const refreshBCycleStatus = setInterval(() => {
      fetch(GBFS_BASE_URL + '/station_status.json')
        .then((res) => res.json())
        .then((s) => setBCycleStationStatusData(s.data.stations))
    }, REFRESH_GBFS_TTL)

    // Run on unmount
    return () => {
      clearInterval(refreshPositionsInterval)
      clearInterval(refreshAlertsInterval)
      clearInterval(refreshBCycleStatus)
    }
  }, []);

  const locateUserOnMap = function(map) {
    if (typeof map.current !== 'undefined' && map.current) {
      map.current.locate()
    }
  }

  // Combine BCycle data into one hash
  if (bCycleStations.length > 0 && bCycleStationsStatus.length > 0) {
    bCycleStations.forEach((station, index) => {
      bCycleStations[index].status = bCycleStationsStatus.find(s => station.station_id === s.station_id)
    })
  }

  const mapControls = {
    topRight: (
      <div className="map-top-right-container">
        <MapLinks></MapLinks>
      </div>
    ),
    bottomLeft: (
      <div className="d-flex map-bottom-left-container">
        <AlertButton alerts={alerts} buttonAction={() => setAlertModalShow(true)}></AlertButton>
        <LocateButton buttonAction={() => locateUserOnMap(map)}></LocateButton>
      </div>
    )
  }

  return(
    (!isAlertLoaded || !isAgencyLoaded || !isRoutesLoaded || !isVehiclePositionLoaded ) ? (
      <LoadingScreen hideTitleBar={true}></LoadingScreen>
    ) : (
      <div className="main">
        <TransitMap routes={routes} agencies={agencies} vehicleMarkers={vehicleMarkers} shapes={[]} alerts={alerts} map={map} bCycleStations={bCycleStations} mapControls={mapControls}></TransitMap>
        <AlertModal alerts={alerts} show={alertModalShow} onHide={() => setAlertModalShow(false)} routes={routes}></AlertModal>
      </div>
    )
  )
}

export default Main

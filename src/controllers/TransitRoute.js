

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NoMatch from './NoMatch'
import TitleBar from '../components/TitleBar'
import LoadingScreen from '../components/LoadingScreen'
import TransitMap from '../components/TransitMap'
import TripTable from '../components/TripTable'
import Footer from '../components/Footer'
import { getJSON, formatPositionData } from './../util.js';
import AlertList from '../components/AlertList'
import DataFetchError from '../components/DataFetchError'
import TransitRouteHeader from '../components/TransitRouteHeader'

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;
const REFRESH_VEHICLE_POSITIONS_TTL = 7000;

function TransitRoute() {
  const [route, setRouteData] = useState({});
  const [route_trips, setRouteTripsData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [agencies, setAgencyData] = useState([]);
  const [vehicleMarkers, setVehicleMarkers] = useState([]);
  const [isRouteLoaded, setRouteLoaded] = useState(false);
  const [isRouteTripsLoaded, setRouteTripsLoaded] = useState(false);
  const [isAlertLoaded, setAlertLoaded] = useState(false);
  const [isAgencyLoaded, setAgencyLoaded] = useState(false);
  const [isVehiclePositionLoaded, setVehiclePositionLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false)

  const params = useParams();

  useEffect(() => {
    getJSON(GTFS_BASE_URL + '/routes/' + params.route_id + '.json')
      .then((r) => setRouteData(r))
      .then(() => setRouteLoaded(true))
      .catch((error) => setDataFetchError(error))

    getJSON(GTFS_BASE_URL + '/routes/' + params.route_id + '/trips.json?per_page=500')
      .then((r) => setRouteTripsData(r.data))
      .then(() => setRouteTripsLoaded(true))
      .catch((error) => setDataFetchError(error))

    getJSON(GTFS_BASE_URL + '/agencies.json')
      .then((a) => setAgencyData(a.data))
      .then(() => setAgencyLoaded(true))
      .catch((error) => setDataFetchError(error))

    getJSON(GTFS_BASE_URL + '/realtime/alerts.json')
      .then((data) => setAlerts(data))
      .then(() => setAlertLoaded(true))
      .catch((error) => setDataFetchError(error))

    getJSON(GTFS_BASE_URL + '/realtime/vehicle_positions.json')
      .then(function (data) {
        data = data.filter(v => v.vehicle.trip.route_id === params.route_id)
        return formatPositionData(data)
      })
      .then((data) => setVehicleMarkers(data))
      .then(() => setVehiclePositionLoaded(true))
      .catch((error) => setDataFetchError(error))

    // Refresh position data at set interval
    const refreshPositionsInterval = setInterval(() => {
      getJSON(GTFS_BASE_URL + '/realtime/vehicle_positions.json')
        .then(function (data) {
          data = data.filter(v => v.vehicle.trip.route_id === params.route_id)
          return formatPositionData(data)
        })
        .then((data) => setVehicleMarkers(data))
        .catch((error) => setDataFetchError(error))
    }, REFRESH_VEHICLE_POSITIONS_TTL);

    // Run on unmount
    return () => {
      clearInterval(refreshPositionsInterval)
    }
  }, [params.route_id]);

  if (dataFetchError) {
    return(<DataFetchError error={dataFetchError}></DataFetchError>)
  }

  if (!isAlertLoaded || !isAgencyLoaded || !isRouteLoaded || !isRouteTripsLoaded || !isVehiclePositionLoaded) {
    return(<LoadingScreen></LoadingScreen>)
  }

  // No matching route
  if (!route || route.status === 404) {
    return(<NoMatch></NoMatch>)
  }

  const routeAlerts = alerts.filter((a) => a.alert.informed_entity[0].route_id === route.route_short_name)

  // Extract unique shapes
  let shapes = route_trips.map((item, _index) => {
    item.shape['route_color'] = route.route_color
    return item.shape
  })
  shapes = [...new Map(shapes.map((item, _key) => [item['id'], item])).values()];

  return(
    <div>
      <TitleBar></TitleBar>
      <div className="container routes">
        <TransitRouteHeader route={route} alerts={routeAlerts} showRouteType={true}></TransitRouteHeader>
        <TransitMap vehicleMarkers={vehicleMarkers} routes={[route]} agencies={agencies} routeShapes={shapes} alerts={routeAlerts}></TransitMap>
        <AlertList alerts={routeAlerts} routes={[route]}></AlertList>
        <TripTable route={route} routeTrips={route_trips}></TripTable>
      </div>
      <Footer></Footer>
    </div>
  )
}

export default TransitRoute



import React, { useEffect, useState } from 'react'
import TitleBar from '../components/TitleBar'
import LoadingScreen from '../components/LoadingScreen'
import {getJSON} from './../util.js';
import Footer from '../components/Footer'
import DataFetchError from '../components/DataFetchError'
import TransitRouteHeader from '../components/TransitRouteHeader'

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;

function TransitRoutes() {
  const [routes, setRouteData] = useState({});
  const [alerts, setAlerts] = useState({});
  const [isRoutesLoaded, setRoutesLoaded] = useState(false);
  const [isAlertLoaded, setAlertLoaded] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false)

  useEffect(() => {
    getJSON(GTFS_BASE_URL + '/routes.json')
      .then(function (r) {
        r.data.sort(function (a, b) {
          return (parseInt(a.route_short_name, 10) > parseInt(b.route_short_name, 10)) ? 1 : -1;
        })
        return r;
      })
      .then((r) => setRouteData(r.data))
      .then(() => setRoutesLoaded(true))
      .catch((error) => setDataFetchError(error))

    getJSON(GTFS_BASE_URL + '/realtime/alerts.json')
      .then((data) => setAlerts(data))
      .then(() => setAlertLoaded(true))
      .catch((error) => setDataFetchError(error))
  }, []);

  if (dataFetchError) {
    return(<DataFetchError error={dataFetchError}></DataFetchError>)
  }

  return(
    (!isAlertLoaded || !isRoutesLoaded ) ? (
      <LoadingScreen></LoadingScreen>
    ) : (
      <div>
        <TitleBar></TitleBar>
        <div className="container routes">
          {routes.map((item, _index) => {
            const routeAlerts = alerts.filter((a) => a.alert.informed_entity[0].route_id === item.route_short_name)
            return(<TransitRouteHeader key={item.id} route={item} alerts={routeAlerts} showRouteType={true}></TransitRouteHeader>)
          })}
        </div>
        <Footer></Footer>
      </div>
    )
  )
}

export default TransitRoutes

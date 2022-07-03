import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TitleBar from '../components/TitleBar'
import LoadingScreen from '../components/LoadingScreen'
import busMarkerIcon from '../resources/bus.svg'
import trainMarkerIcon from '../resources/train.svg'
import {hex_is_light} from './../util.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import Footer from '../components/Footer'

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;

function TransitRoutes() {
  const [routes, setRouteData] = useState({});
  const [alerts, setAlerts] = useState({});
  const [isRoutesLoaded, setRoutesLoaded] = useState(false);
  const [isAlertLoaded, setAlertLoaded] = useState(false);

  useEffect(() => {
    fetch(GTFS_BASE_URL + '/routes.json')
      .then((res) => res.json())
      .then(function (r) {
        r.data.sort(function (a, b) {
          return (parseInt(a.route_short_name, 10) > parseInt(b.route_short_name, 10)) ? 1 : -1;
        })
        return r;
      })
      .then((r) => setRouteData(r.data))
      .then(() => setRoutesLoaded(true));

    fetch(GTFS_BASE_URL + '/realtime/alerts.json')
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .then(() => setAlertLoaded(true));
  }, []);

  return(
    (!isAlertLoaded || !isRoutesLoaded ) ? (
      <LoadingScreen></LoadingScreen>
    ) : (
      <div>
        <TitleBar></TitleBar>
        <div className="container routes">
          {routes.map((item, _index) => {
            const routeStyle = {
              backgroundColor: '#' + item.route_color,
              color: hex_is_light(item.route_color) ? '#000' : '#FFF'
            }
            const vehicle_icon = (item.route_type === '2') ? trainMarkerIcon : busMarkerIcon
            const route_alerts = alerts.filter((a) => a.alert.informed_entity[0].route_id === item.route_short_name)
            const route_alert_button = (route_alerts.length > 0)
              ? (
                  <div className="route-alert-icon">
                    <FontAwesomeIcon icon={faWarning}></FontAwesomeIcon>
                  </div>
                )
              : (
                <></>
                )


            return(
              <div key={item.route_short_name}>
                <div className="route-name" style={routeStyle} title={item.route_desc}>
                  <Link to={"/routes/" + item.route_short_name}>
                    <img className="route-icon" src={vehicle_icon} alt="Icon" />
                    {item.route_short_name} - {item.route_long_name}
                    {route_alert_button}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
        <Footer></Footer>
      </div>
    )
  )
}

export default TransitRoutes

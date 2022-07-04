import React from 'react'
import PropTypes from 'prop-types'
import { MapContainer, TileLayer, LayersControl, LayerGroup, Polyline } from 'react-leaflet';
import VehicleMarker from './VehicleMarker';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import bCycleIconImage from '../resources/bcycle.svg'
import './TransitMap.scss';
import './StopMarker'
import { format_shape_points } from '../util';
import { useState, useCallback } from 'react';
import LocationMarker from './LocationMarker';
import BCycleMarker from './BCycleMarker';
import StopMarker from './StopMarker';

// Fix paths for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: markerIcon,
	iconRetinaUrl: markerIcon2x,
	shadowUrl: markerShadow,
});

function TransitMap({routes, agencies, vehicle_markers, route_shapes, route_stops, alerts, map, bCycleStations}) {
  vehicle_markers = (typeof vehicle_markers !== 'undefined') ? vehicle_markers : []
  route_shapes = (typeof route_shapes !== 'undefined') ? route_shapes : []
  route_stops = (typeof route_stops !== 'undefined') ? route_stops : []
  bCycleStations = (typeof bCycleStations !== 'undefined') ? bCycleStations : []
  alerts = (typeof alerts !== 'undefined') ? alerts : []

  const [shapes, setShapes] = useState(route_shapes);
  const doSetShapes = useCallback(val => {
    setShapes(val)
  }, [setShapes])

  const [stops, setStops] = useState(route_stops);
  const doSetStops = useCallback(val => {
    setStops(val)
  }, [setStops])

  const getRouteDataById = function (route_gid) {
    return routes.find(r => r.route_gid === route_gid)
  }

  const getAgencyDataById = function (agency_gid) {
    return agencies.find(a => a.agency_gid === agency_gid)
  }

  const getRouteAlertsById = function (route_gid) {
    return alerts.filter(a => a.alert.informed_entity[0].route_id === route_gid)
  }

  const getStopAlertsById = function (stop_code) {
    let stopAlerts = []
    alerts.forEach(a => {
      a.alert.informed_entity.forEach(e => {
        if (e.stop_id === stop_code) {
          stopAlerts.push(a)
        }
      })
    });
    return stopAlerts
  }

  const cityCenter = [36.166512, -86.781581]
  const cityMaxBounds = [
    [36.725005, -87.579122], // northwest
    [35.541600, -86.097066]  // southeast
  ]

  const shapeEventHandlers = {
    click: (_e) => {
      setShapes([])
      setStops([])
    }
  }

  const bCycleMarkerIcon = L.Icon.extend({
    options: {
      iconUrl: bCycleIconImage,
      iconSize: [24, 24],
      shadowUrl: null
    }
  })
  const bCycleIcon = new bCycleMarkerIcon()

  return(
    <MapContainer ref={map} className="map-container" center={cityCenter} zoom={12} scrollWheelZoom={true} maxBounds={cityMaxBounds} doubleClickZoom={false}>
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright" target="blank">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions" target="blank">CartoDB</a>; Data by <a href="http://www.wegotransit.com" target="blank">WeGo Public Transit</a>'
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
        subdomains='abcd'
        minZoom={11}
        maxZoom={19}
      />
      <LayersControl position="topright">
        <LayersControl.Overlay checked={true} name="Vehicles">
          <LayerGroup>
            {vehicle_markers.map((item, _index) => {
              let route = getRouteDataById(item.metadata.trip.route_id)
              let route_alerts = getRouteAlertsById(item.metadata.trip.route_id)
              let agency = getAgencyDataById(route ? route.agency_gid : {})
              let trip_id = item.metadata.trip.trip_id

              return(
                <VehicleMarker key={item.id} position={item.position} speed={item.speed} bearing={item.bearing} metadata={item.metadata} route={route} agency={agency} trip_id={trip_id} timestamp={item.timestamp} shapeSetter={doSetShapes} stopSetter={doSetStops} alerts={route_alerts}></VehicleMarker>
              )
            })}
          </LayerGroup>
        </LayersControl.Overlay>
        {shapes.length > 0 &&
          <LayersControl.Overlay checked={true} name="Routes">
            <LayerGroup>
              {shapes.map((item, _index) => {
                return(
                  <Polyline key={item.shape_gid} opacity={0.6} weight={5} positions={format_shape_points(item.points)} color={'#' + item.route_color} eventHandlers={shapeEventHandlers}></Polyline>
                )
              })}
            </LayerGroup>
          </LayersControl.Overlay>
        }
        {stops.length > 0 &&
          <LayersControl.Overlay checked={true} name="Stops">
            <LayerGroup>
              {stops.map((item, _index) => {
                let stop_alerts = getStopAlertsById(item.stop.stop_code)
                return(<StopMarker key={item.id} stop_time={item} stop_alerts={stop_alerts}></StopMarker>)
              })}
             </LayerGroup>
          </LayersControl.Overlay>
        }
        {bCycleStations.length > 0 &&
          <LayersControl.Overlay checked={true} name="BCycle Stations">
            <LayerGroup>
              {bCycleStations.map((item, _index) => {
                return(
                  <BCycleMarker key={item.station_id} station={item} icon={bCycleIcon}></BCycleMarker>
                )
              })}
             </LayerGroup>
          </LayersControl.Overlay>
        }
      </LayersControl>
      <LocationMarker map={map}></LocationMarker>
    </MapContainer>
  );
}

TransitMap.propTypes = {
  routes: PropTypes.array,
  agencies: PropTypes.array,
  vehicle_markers: PropTypes.array,
  route_shapes: PropTypes.array,
  route_stops: PropTypes.array,
  alerts: PropTypes.array,
  map: PropTypes.any,
  bCycleStations: PropTypes.array
}

export default TransitMap

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  MapContainer, TileLayer, LayersControl, LayerGroup, Polyline, FeatureGroup, GeoJSON,
} from 'react-leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import VehicleMarker from './VehicleMarker';
import 'leaflet/dist/leaflet.css';
import './TransitMap.scss';
import StopMarker from './StopMarker';
import { formatShapePoints } from '../util';
import LocationMarker from './LocationMarker';
import BCycleMarker from './BCycleMarker';
import LocateButton from './LocateButton';
import countyBorders from '../lib/davidson_county_borders.json';

// Fix paths for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function TransitMap({
  routes, agencies, vehicleMarkers, routeShapes, routeStops, alerts, tripUpdates, map, bCycleStations, mapControls, center, zoom,
}) {
  const [shapes, setShapes] = useState(routeShapes);
  const doSetShapes = useCallback((val) => {
    setShapes(val);
  }, [setShapes]);

  const [stops, setStops] = useState(routeStops);
  const doSetStops = useCallback((val) => {
    setStops(val);
  }, [setStops]);

  const getRouteDataById = function (routeId) {
    const routeData = routes.find((r) => r.route_gid === routeId || r.route_short_name === routeId);
    if (!routeData) {
      return {};
    }
    return routeData;
  };

  const getAgencyDataById = function (agencyId) {
    const agencyData = agencies.find((a) => a.agency_gid === agencyId);
    if (!agencyData) {
      return {};
    }
    return agencyData;
  };

  const getRouteAlertsById = function (routeId) {
    return alerts.filter((a) => a.alert.informed_entity[0].route_id === routeId);
  };

  const getStopAlertsById = function (stopCode) {
    const stopAlerts = [];
    alerts.forEach((a) => {
      a.alert.informed_entity.forEach((e) => {
        if (e.stop_id === stopCode) {
          stopAlerts.push(a);
        }
      });
    });
    return stopAlerts;
  };

  const getTripUpdateById = (tripId) => tripUpdates.find((i) => tripId === i.trip_update.trip.trip_id);

  const getStopUpdateByTripAndId = function (tripId, stopCode) {
    let stopUpdate = {};
    const trip = tripUpdates.find((item) => tripId === item.trip_update.trip.trip_id);
    if (trip) {
      trip.trip_update.stop_time_update.map((stu) => {
        if (stu.stop_id === stopCode) {
          stopUpdate = stu;
        }
      });
    }
    return stopUpdate;
  };

  const cityMaxBounds = [
    [36.725005, -87.579122], // northwest
    [35.541600, -86.097066], // southeast
  ];

  const shapeEventHandlers = {
    click: (_e) => {
      setShapes([]);
      setStops([]);
    },
  };

  const locateUserOnMap = function (map) {
    if (typeof map.current !== 'undefined' && map.current) {
      map.current.locate();
    }
  };

  return (
    <MapContainer ref={map} className="map-container" center={center} zoom={zoom} scrollWheelZoom={true} maxBounds={cityMaxBounds} doubleClickZoom={false}>
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright" target="blank">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions" target="blank">CartoDB</a>; <a href="http://www.wegotransit.com" target="blank">WeGo</a>'
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
        subdomains='abcd'
        minZoom={10}
        maxZoom={19}
        className='map-tiles'
      />
      <LayersControl position="topright">
        {vehicleMarkers.length > 0 && (
          <LayersControl.Overlay checked={true} name="Vehicles">
            <LayerGroup>
              {vehicleMarkers.map((item, _index) => {
                const route = getRouteDataById(item.vehicle.trip.route_id);
                const routeAlerts = getRouteAlertsById(item.vehicle.trip.route_id);
                const agency = getAgencyDataById(route ? route.agency_gid : {});
                const tripUpdate = getTripUpdateById(item.vehicle.trip.trip_id);
                return (
                  <VehicleMarker key={item.id} vehiclePositionData={item} route={route} agency={agency} tripUpdate={tripUpdate} shapeSetter={doSetShapes} stopSetter={doSetStops} alerts={routeAlerts}></VehicleMarker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {shapes.length > 0
          && <LayersControl.Overlay checked={true} name="Routes">
            <LayerGroup>
              {shapes.map((item, _index) => (
                  <FeatureGroup key={item.shape_gid} eventHandlers={shapeEventHandlers}>
                    <Polyline weight={12} positions={formatShapePoints(item.points)} color='#ffffff'></Polyline>
                    <Polyline weight={8} positions={formatShapePoints(item.points)} color={`#${item.route_color}`}></Polyline>
                  </FeatureGroup>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        }
        {stops.length > 0
          && <LayersControl.Overlay checked={true} name="Stops">
            <LayerGroup>
              {stops.map((item, _index) => {
                const stopAlerts = getStopAlertsById(item.stop.stop_code);
                const stopUpdate = getStopUpdateByTripAndId(item.trip_gid, item.stop.stop_code);
                return (<StopMarker key={item.id} stop={item.stop} stopTime={item} stopUpdate={stopUpdate} stopAlerts={stopAlerts}></StopMarker>);
              })}
             </LayerGroup>
          </LayersControl.Overlay>
        }
        {bCycleStations.length > 0
          && <LayersControl.Overlay checked={true} name="BCycle Stations">
            <LayerGroup>
              {bCycleStations.map((item, _index) => (
                  <BCycleMarker key={item.station_id} station={item}></BCycleMarker>
              ))}
             </LayerGroup>
          </LayersControl.Overlay>
        }

        <LayersControl.Overlay checked={true} name="City Border">
          <GeoJSON data={countyBorders} style={{
            fillColor: 'transparent', opacity: 0.5, color: 'gray', dashArray: 4,
          }}></GeoJSON>
        </LayersControl.Overlay>

        {(typeof mapControls.topRight !== 'undefined')
          && (
            <>{mapControls.topRight}</>
          )
        }
      </LayersControl>
      <LocationMarker map={map}></LocationMarker>
      {(typeof mapControls.bottomLeft !== 'undefined')
        ? (
          <>{mapControls.bottomLeft}</>
        ) : (
          <div className="d-flex map-bottom-left-container">
            <LocateButton buttonAction={() => locateUserOnMap(map)}></LocateButton>
          </div>
        )
      }
    </MapContainer>
  );
}

TransitMap.propTypes = {
  routes: PropTypes.array,
  agencies: PropTypes.array,
  vehicleMarkers: PropTypes.array,
  routeShapes: PropTypes.array,
  routeStops: PropTypes.array,
  alerts: PropTypes.array,
  tripUpdates: PropTypes.array,
  map: PropTypes.any.isRequired,
  bCycleStations: PropTypes.array,
  mapControls: PropTypes.object,
  center: PropTypes.any,
  zoom: PropTypes.number,
};

TransitMap.defaultProps = {
  routes: [],
  agencies: [],
  vehicleMarkers: [],
  routeShapes: [],
  routeStops: [],
  alerts: [],
  tripUpdates: [],
  bCycleStations: [],
  mapControls: {},
  center: [36.166512, -86.781581],
  zoom: 12,
};

export default TransitMap;
